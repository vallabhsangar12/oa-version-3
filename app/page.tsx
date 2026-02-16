"use client"

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
} from "lucide-react"

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: Brain,
      title: "Resume-Based Questioning",
      description:
        "AI analyzes your resume to generate personalized interview questions tailored to your skills and experience.",
    },
    {
      icon: Video,
      title: "Live AI Video Interview",
      description:
        "Practice with our AI interviewer through live video sessions with adaptive follow-up questions.",
    },
    {
      icon: Sparkles,
      title: "Facial Emotion Recognition",
      description:
        "Advanced computer vision tracks confidence and engagement through real-time facial expression analysis.",
    },
    {
      icon: Mic,
      title: "Speech Pattern Analysis",
      description:
        "Analyze speech pace, filler words, pauses, and tone to provide comprehensive communication feedback.",
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scoring System",
      description:
        "Get scored on multiple dimensions including answer quality, emotional stability, and communication skills.",
    },
    {
      icon: Award,
      title: "Personalized Coaching",
      description:
        "Personalized training content and practice modules based on your performance and improvement areas.",
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
        <section className="relative overflow-hidden bg-background">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent)_0%,transparent_50%)] opacity-[0.08]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                AI-Powered Interview Preparation
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight">
                Master Your Interviews with Intelligent AI Coaching
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
                Get real-time feedback, emotion analysis, and personalized coaching powered by advanced AI.
                Practice like the real thing, perform at your best.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" onClick={() => router.push("/register")} className="min-w-[180px]">
                  Start Free Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/interview-ui")}
                  className="min-w-[180px]"
                >
                  Try a Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
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
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Powerful Features</h2>
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
                    className="group border border-border bg-card p-8 transition-all duration-200 hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
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

        {/* How It Works */}
        <section className="border-t border-border bg-secondary/20 py-20 sm:py-28">
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
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
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
                  Why Choose OneselfAI?
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
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <p className="text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border border-border bg-card p-8">
                <h3 className="mb-6 text-2xl font-bold text-foreground">Ready to Get Started?</h3>
                <p className="mb-8 leading-relaxed text-muted-foreground">
                  Create a free account and start practicing for your next interview today.
                  No credit card required.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => router.push("/register")}>
                    Create Free Account
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-foreground hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-primary py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Join thousands of professionals who have improved their interview performance with OneselfAI.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
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
