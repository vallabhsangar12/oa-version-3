"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowRight,
  Brain,
  Video,
  Mic,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Play,
} from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  const demoRef = useRef<HTMLElement>(null)

  const scrollToDemo = useCallback(() => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleStartPractice = useCallback(async () => {
    setIsCheckingAuth(true)
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        router.push("/interview")
      } else {
        router.push("/login")
      }
    } catch {
      router.push("/login")
    } finally {
      setIsCheckingAuth(false)
    }
  }, [router])

  const features = [
    {
      icon: Brain,
      title: "Resume-Based Questioning",
      description:
        "AI analyzes your resume to generate personalized interview questions tailored to your skills and experience.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: Video,
      title: "Live AI Video Interview",
      description:
        "Practice with our AI interviewer through live video sessions with adaptive follow-up questions.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Facial Emotion Recognition",
      description:
        "Advanced computer vision tracks confidence and engagement through real-time facial expression analysis.",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: Mic,
      title: "Speech Pattern Analysis",
      description:
        "Analyze speech pace, filler words, pauses, and tone to provide comprehensive communication feedback.",
      gradient: "from-teal-500 to-green-500",
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scoring System",
      description:
        "Get scored on multiple dimensions including answer quality, emotional stability, and communication skills.",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: Award,
      title: "Personalized Coaching",
      description:
        "Personalized training content and practice modules based on your performance and improvement areas.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ]

  const stats = [
    { value: "10K+", label: "Interviews Completed" },
    { value: "95%", label: "User Satisfaction" },
    { value: "3x", label: "Faster Preparation" },
    { value: "85%", label: "Success Rate" },
  ]

  const steps = [
    {
      step: "01",
      title: "Upload Your Resume",
      description: "Upload your resume and select interview type and difficulty level.",
    },
    {
      step: "02",
      title: "Practice with AI",
      description: "Our AI generates personalized questions and conducts a realistic interview session.",
    },
    {
      step: "03",
      title: "Get Detailed Feedback",
      description: "Receive comprehensive scoring on communication, confidence, and answer quality.",
    },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-purple-400">
                AI-Powered Interview Preparation
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-tight">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Master Your Interviews
                </span>
                <br />
                <span className="text-foreground">with Intelligent AI Coaching</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
                Get real-time feedback, emotion analysis, and personalized coaching powered by advanced AI.
                Practice like the real thing, perform at your best.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleStartPractice}
                  disabled={isCheckingAuth}
                  className="min-w-[180px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isCheckingAuth ? "Checking..." : "Start Free Practice"}
                  {!isCheckingAuth && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToDemo}
                  className="min-w-[180px] border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Try Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-indigo-900/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Powerful</span> Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to prepare for your dream job interview.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="group border border-border bg-card p-8 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1"
                  >
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        <section
          id="demo-section"
          ref={demoRef}
          className="scroll-mt-20 border-t border-border bg-gradient-to-b from-purple-900/10 to-blue-900/10 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">See It</span>{" "}
                <span className="text-foreground">In Action</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Watch how OneselfAI conducts real-time AI interviews with emotion analysis and personalized feedback.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-purple-500/20 bg-card shadow-2xl shadow-purple-500/5">
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="OneselfAI Demo - AI Interview Platform"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  onClick={handleStartPractice}
                  disabled={isCheckingAuth}
                  className="min-w-[200px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isCheckingAuth ? "Checking..." : "Start Practicing Now"}
                  {!isCheckingAuth && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-border bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-indigo-900/10 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps to transform your interview performance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Why Choose <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">OneselfAI</span>?
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Our AI-powered platform provides the most realistic interview practice experience available.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    "Realistic AI interviewer with natural conversation flow",
                    "Real-time emotion and body language analysis",
                    "Personalized questions based on your resume",
                    "Detailed performance reports and scoring",
                    "Practice anytime, anywhere at your convenience",
                    "Track improvement over time with analytics",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
                      <p className="text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border border-purple-500/20 bg-gradient-to-br from-card to-card/50 p-8">
                <h3 className="mb-6 text-2xl font-bold text-foreground">Ready to Get Started?</h3>
                <p className="mb-8 leading-relaxed text-muted-foreground">
                  Create a free account and start practicing for your next interview today.
                  No credit card required.
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                    onClick={() => router.push("/register")}
                  >
                    Create Free Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Join thousands of professionals who have improved their interview performance with OneselfAI.
            </p>
            <Button
              size="lg"
              className="mt-8 bg-white text-purple-900 hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push("/register")}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
