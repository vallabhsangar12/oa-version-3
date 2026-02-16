"use client"

import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, ArrowRight, BarChart3, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function ResultPage() {
  const params = useSearchParams()
  const score = params.get("score") || "N/A"
  const type = params.get("type") || "Interview"
  const difficulty = params.get("difficulty") || ""

  const numericScore = parseInt(score, 10)
  const isNumeric = !isNaN(numericScore)

  const getScoreColor = () => {
    if (!isNumeric) return "text-muted-foreground"
    if (numericScore >= 80) return "text-green-500"
    if (numericScore >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = () => {
    if (!isNumeric) return "Completed"
    if (numericScore >= 80) return "Excellent"
    if (numericScore >= 60) return "Good"
    if (numericScore >= 40) return "Needs Improvement"
    return "Keep Practicing"
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mb-2 text-3xl font-bold text-foreground">Interview Completed</h1>
          <p className="mb-8 text-muted-foreground">
            {type.charAt(0).toUpperCase() + type.slice(1)} Interview
            {difficulty ? ` - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : ""}
          </p>

          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Your Score</p>
            <p className={`text-6xl font-bold ${getScoreColor()}`}>
              {isNumeric ? numericScore : score}
              {isNumeric && <span className="text-2xl text-muted-foreground">/100</span>}
            </p>
            <p className={`mt-2 text-lg font-medium ${getScoreColor()}`}>{getScoreLabel()}</p>
          </div>

          <p className="mb-8 text-muted-foreground">
            Thank you for completing the interview. Review your dashboard for detailed performance insights.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" /> View Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/interview-ui">
                <RotateCcw className="mr-2 h-4 w-4" /> Practice Again
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowRight className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
