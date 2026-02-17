'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Mic, Video, Loader } from 'lucide-react'

const COUNTDOWN_SECONDS = 10

export default function InterviewLoadingPage() {
  const router = useRouter()
  const params = useParams()
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isReadyChecked, setIsReadyChecked] = useState(false)

  useEffect(() => {
    // Countdown to start
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Countdown finished, redirect to interview
      router.push(`/interview/session/${params.id}/conduct`)
    }
  }, [countdown, router, params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/5 to-blue-900/5 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Interview Starting Soon
            </h1>
            <p className="text-lg text-muted-foreground">
              Get ready for your AI-powered interview experience
            </p>
          </div>

          {/* System Check Cards */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {/* Microphone Check */}
            <Card className="border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Mic className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Microphone</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Testing microphone access...
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-green-500 rounded-sm animate-pulse" />
                      <div className="w-1 h-3 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1 h-2 bg-green-500 rounded-sm animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Camera Check */}
            <Card className="border border-border p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Camera</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Testing camera access...
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Countdown Circle */}
          <div className="text-center mb-12">
            <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full border-4 border-gradient-to-r from-purple-600 to-blue-600 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Starting in</p>
                <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                  {countdown}
                </p>
              </div>
            </div>

            {countdown === 0 && (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin text-purple-600" />
                <p className="text-foreground font-medium">Initializing interview...</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <Card className="border border-border p-6 bg-secondary/30">
            <h3 className="font-semibold text-foreground mb-3">Interview Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Find a quiet, well-lit location</li>
              <li>✓ Ensure your camera and microphone are working properly</li>
              <li>✓ Have a glass of water nearby</li>
              <li>✓ Sit up straight and make eye contact with the camera</li>
              <li>✓ Take your time to answer questions thoughtfully</li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
