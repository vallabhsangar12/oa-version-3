'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Gauge, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface SessionData {
  id: number
  interview_type: string
  difficulty: string
  job_role: string
  experience_years: number
  tech_stack: string[]
  status: string
  created_at: string
}

export default function InterviewSessionPage() {
  const params = useParams()
  const sessionId = params.id
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/interview-session/${sessionId}`, {
          credentials: 'include',
        })

        if (!res.ok) {
          setError('Failed to load session')
          setIsLoading(false)
          return
        }

        const data = await res.json()
        setSessionData(data)
      } catch (err) {
        console.error('[v0] Error fetching session:', err)
        setError('Error loading session data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading interview session...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Unable to load interview session'}
            </p>
            <Link href="/interview">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold">
                Back to Interview Setup
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Interview Session Ready
            </h1>
            <p className="text-lg text-muted-foreground">
              Your interview has been configured. The AI interviewer will begin shortly.
            </p>
          </div>

          {/* Session Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 border border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                Interview Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Interview Type</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {sessionData.interview_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty Level</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {sessionData.difficulty}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                Job Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Target Role</p>
                  <p className="text-lg font-semibold text-foreground">
                    {sessionData.job_role}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-lg font-semibold text-foreground">
                    {sessionData.experience_years} years
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tech Stack */}
          {sessionData.tech_stack && sessionData.tech_stack.length > 0 && (
            <Card className="p-6 border border-border mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {sessionData.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm font-medium text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Status Message */}
          <Card className="p-6 border-2 border-purple-600 bg-purple-500/5 mb-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Interview Engine Integration
                </h3>
                <p className="text-muted-foreground text-sm">
                  The AI interview engine will be integrated in the next phase. This session is configured and ready. Your session ID is: <span className="font-mono font-semibold text-purple-600">{sessionId}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Session Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 border border-border hover:border-purple-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <Gauge className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Real-time Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Facial emotion detection & voice analysis
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border hover:border-purple-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Smart Evaluation</h4>
                  <p className="text-xs text-muted-foreground">
                    Technical & communication scoring
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border hover:border-purple-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Instant Feedback</h4>
                  <p className="text-xs text-muted-foreground">
                    Detailed results and recommendations
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/interview/session/${sessionId}/loading`} className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
              >
                Start AI Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full border border-purple-500/30 hover:bg-purple-500/10 py-6 text-lg"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
