"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
      // In dev mode, show the reset link directly
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md p-8 shadow-xl">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Forgot Password
                </h1>
                <p className="text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">
                If an account exists with that email, a reset link has been generated.
              </p>
              {resetUrl && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Dev mode - reset link:
                  </p>
                  <Link
                    href={resetUrl}
                    className="text-accent hover:underline break-all text-sm"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/login"
              className="text-sm text-accent hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}
