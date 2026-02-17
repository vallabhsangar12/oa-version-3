'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Video, VideoOff, Phone, Clock, Volume2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getRandomQuestion } from '@/lib/interview-questions'

interface EmotionData {
  emotion: string
  confidence: number
  timestamp: number
}

export default function InterviewConductPage() {
  const router = useRouter()
  const params = useParams()
  
  // State management
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions] = useState(5)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120)
  const [emotions, setEmotions] = useState<EmotionData[]>([])
  const [currentEmotion, setCurrentEmotion] = useState('neutral')
  const [emotionConfidence, setEmotionConfidence] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize video stream
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          setIsRecording(true)
        }
      } catch (error) {
        console.error('[v0] Error accessing media devices:', error)
        toast.error('Unable to access camera or microphone')
      }
    }

    initializeStream()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Timer for question
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion()
          return 120
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [questionIndex])

  // Simulated emotion detection from video
  useEffect(() => {
    const emotionInterval = setInterval(() => {
      const emotions = ['neutral', 'happy', 'confident', 'focused', 'thinking']
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      const confidence = Math.floor(Math.random() * 40) + 60

      setCurrentEmotion(randomEmotion)
      setEmotionConfidence(confidence)
      
      setEmotions((prev) => [
        ...prev,
        {
          emotion: randomEmotion,
          confidence,
          timestamp: Date.now(),
        },
      ])
    }, 2000)

    return () => clearInterval(emotionInterval)
  }, [])

  const currentQuestion = getRandomQuestion('medium')

  const handleNextQuestion = () => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1)
      setTimeRemaining(120)
    } else {
      handleFinishInterview()
    }
  }

  const handleFinishInterview = async () => {
    setIsRecording(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    try {
      const res = await fetch('/api/interview-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: params.id,
          emotions,
          question_count: totalQuestions,
        }),
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Interview completed!')
        router.push(`/interview/results/${data.result_id}`)
      }
    } catch (error) {
      console.error('[v0] Error finishing interview:', error)
      toast.error('Error finishing interview. Redirecting...')
      router.push('/dashboard')
    }
  }

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMicOn(!isMicOn)
    }
  }

  const toggleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsCameraOn(!isCameraOn)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simplified Header - no navbar during interview */}
      <header className="border-b border-border bg-card p-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Interview in Progress</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
            <Button
              onClick={handleFinishInterview}
              variant="destructive"
              size="sm"
            >
              <Phone className="mr-2 h-4 w-4" />
              End Interview
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video & Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Feed */}
              <Card className="border-2 border-purple-500/20 overflow-hidden bg-black">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full"
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <VideoOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Emotion Indicator */}
                  <div className="absolute top-4 right-4 bg-black/60 rounded-lg px-3 py-2 backdrop-blur">
                    <p className="text-xs text-muted-foreground mb-1">Current Emotion</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {currentEmotion}
                    </p>
                    <p className="text-xs text-purple-400">
                      {emotionConfidence}% confident
                    </p>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </Card>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={toggleMic}
                  className={`${
                    isMicOn
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-destructive hover:bg-destructive/90'
                  } text-white font-semibold`}
                  size="lg"
                >
                  {isMicOn ? (
                    <>
                      <Mic className="mr-2 h-5 w-5" /> Microphone On
                    </>
                  ) : (
                    <>
                      <MicOff className="mr-2 h-5 w-5" /> Microphone Off
                    </>
                  )}
                </Button>

                <Button
                  onClick={toggleCamera}
                  className={`${
                    isCameraOn
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-destructive hover:bg-destructive/90'
                  } text-white font-semibold`}
                  size="lg"
                >
                  {isCameraOn ? (
                    <>
                      <Video className="mr-2 h-5 w-5" /> Camera On
                    </>
                  ) : (
                    <>
                      <VideoOff className="mr-2 h-5 w-5" /> Camera Off
                    </>
                  )}
                </Button>
              </div>

              {/* Question */}
              <Card className="border border-border p-6 bg-secondary/30">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Question {questionIndex + 1} of {totalQuestions}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: totalQuestions }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i === questionIndex
                            ? 'bg-purple-600'
                            : i < questionIndex
                            ? 'bg-green-600'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-2xl font-semibold text-foreground mb-4">
                  {currentQuestion.question}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground mb-3">Tips:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {currentQuestion.tips.slice(0, 3).map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Analysis & Stats */}
            <div className="space-y-6">
              {/* Progress */}
              <Card className="border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Overall</span>
                      <span className="text-sm font-medium text-foreground">
                        {Math.round((questionIndex / totalQuestions) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
                        style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Emotion Tracking */}
              <Card className="border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Emotion Tracking</h3>
                <div className="space-y-2 text-sm">
                  {emotions.slice(-5).map((e, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-muted-foreground capitalize">{e.emotion}</span>
                      <span className="font-medium text-foreground">{e.confidence}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Alert */}
              <Card className="border border-orange-500/30 bg-orange-500/5 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-600 mb-1">
                      Keep Your Camera On
                    </p>
                    <p className="text-xs text-orange-600/80">
                      Facial expressions are being analyzed for emotion detection and engagement scoring.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Next Question Button */}
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                Skip to Next Question
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
