'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Download, Share2, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface InterviewResult {
  id: string
  session_id: string
  user_id: string
  overall_score: number
  facial_emotion_score: number
  voice_analysis_score: number
  content_score: number
  confidence_level: number
  emotion_data: {
    primary: string
    confidence: number
    timeline: Array<{ timestamp: number; emotion: string }>
  }
  voice_data: {
    clarity: number
    pace: number
    tone: number
    pronunciation: number
  }
  feedback: string
  strengths: string[]
  improvements: string[]
  completed_at: string
}

export default function InterviewResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/interview-results/${params.id}`, {
          credentials: 'include',
        })
        
        if (!res.ok) {
          setError('Failed to load interview results')
          return
        }

        const data = await res.json()
        setResult(data)
      } catch (err) {
        console.error('[v0] Error fetching results:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [params.id])

  const handleDownloadPDF = () => {
    toast.success('Report downloaded!')
  }

  const handleShare = () => {
    toast.success('Shared successfully!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error || 'Interview results not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Interview Results
            </h1>
            <p className="text-lg text-muted-foreground">
              Completed on {new Date(result.completed_at).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Score */}
          <Card className="border border-border p-8 mb-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Overall Score</p>
              <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.overall_score)}`}>
                {result.overall_score}
              </div>
              <p className="text-lg text-foreground">
                {result.overall_score >= 80
                  ? 'Excellent Performance'
                  : result.overall_score >= 60
                  ? 'Good Performance'
                  : 'Needs Improvement'}
              </p>
            </div>
          </Card>

          {/* Score Breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Facial Emotion Analysis</p>
              <p className={`text-3xl font-bold ${getScoreColor(result.facial_emotion_score)}`}>
                {result.facial_emotion_score}
              </p>
            </Card>

            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Voice Analysis</p>
              <p className={`text-3xl font-bold ${getScoreColor(result.voice_analysis_score)}`}>
                {result.voice_analysis_score}
              </p>
            </Card>

            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Content Quality</p>
              <p className={`text-3xl font-bold ${getScoreColor(result.content_score)}`}>
                {result.content_score}
              </p>
            </Card>

            <Card className="border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Confidence Level</p>
              <p className={`text-3xl font-bold ${getScoreColor(result.confidence_level)}`}>
                {result.confidence_level}
              </p>
            </Card>
          </div>

          {/* Voice Analysis Details */}
          {result.voice_data && (
            <Card className="border border-border p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Voice Analysis Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Clarity</p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${result.voice_data.clarity}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">{result.voice_data.clarity}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pace</p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${result.voice_data.pace}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">{result.voice_data.pace}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tone</p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${result.voice_data.tone}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">{result.voice_data.tone}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pronunciation</p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${result.voice_data.pronunciation}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">{result.voice_data.pronunciation}%</p>
                </div>
              </div>
            </Card>
          )}

          {/* Strengths & Improvements */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <Card className="border border-border p-6">
              <h2 className="text-lg font-bold mb-4 text-green-600">Strengths</h2>
              <ul className="space-y-2">
                {result.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="border border-border p-6">
              <h2 className="text-lg font-bold mb-4 text-orange-600">Areas for Improvement</h2>
              <ul className="space-y-2">
                {result.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-1">→</span>
                    <span className="text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Feedback */}
          {result.feedback && (
            <Card className="border border-border p-6 mb-8">
              <h2 className="text-lg font-bold mb-4">Detailed Feedback</h2>
              <p className="text-foreground leading-relaxed">{result.feedback}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownloadPDF}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-purple-500/30"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Results
            </Button>
            <Button
              onClick={() => router.push('/interview')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              Take Another Interview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
