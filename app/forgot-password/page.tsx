"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Something went wrong")
        setIsLoading(false)
        return
      }

      setSubmitted(true)
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-border bg-card p-8 shadow-lg">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">Forgot Password</h1>
                <p className="text-muted-foreground">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-accent" />
              <h2 className="mb-2 text-2xl font-bold text-foreground">Check Your Email</h2>
              <p className="text-muted-foreground">
                If an account exists with that email, a reset link has been generated.
              </p>
              {resetUrl && (
                <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Dev mode - reset link:</p>
                  <Link href={resetUrl} className="text-sm font-medium text-foreground hover:underline break-all">
                    {resetUrl}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 border-t border-border pt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
