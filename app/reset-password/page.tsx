"use client";

import type React from "react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { Loader2, CheckCircle, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
        <p className="text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Password reset successfully");
      } else {
        toast.error(data.error || "Reset failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Password Reset Complete</h1>
        <p className="text-muted-foreground">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => router.push("/login")}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <PasswordInput
            id="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <Link
          href="/login"
          className="text-sm text-accent hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </main>
      <Footer />
    </>
  );
}
