"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AIInterviewer } from "@/components/ai-interviewer"
import { speakText } from "@/src/utils/browserTTS"
import {
  PreInterviewSetup,
  type InterviewSetupData,
} from "@/components/pre-interview-setup"
import { Mic, MicOff, Video, VideoOff, Phone, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function InterviewPage() {
  const router = useRouter()

  // Core state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [showSetup, setShowSetup] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])

  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Speech recognition
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null)
  const [transcript, setTranscript] = useState("")

  // UI toggles
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as Record<string, unknown>).SpeechRecognition ||
      (window as Record<string, unknown>).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)()
    Object.assign(recognition, { continuous: true, lang: "en-US" })

    const rec = recognition as unknown as {
      start: () => void
      stop: () => void
      onstart: (() => void) | null
      onresult: ((event: { results: { length: number; [key: number]: { 0: { transcript: string } } } }) => void) | null
    }

    rec.onstart = () => {
      speechSynthesis.cancel()
      setAiSpeaking(false)
    }

    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      const text = last[0].transcript
      setTranscript(text)
    }

    recognitionRef.current = rec as unknown as ReturnType<typeof createSpeechRecognition>

    return () => {
      try { rec.stop() } catch { /* ignore */ }
    }
  }, [])

  // Start/stop speech recognition with interview
  useEffect(() => {
    if (isInterviewActive) {
      try { (recognitionRef.current as unknown as { start: () => void })?.start() } catch { /* ignore */ }
    } else {
      try { (recognitionRef.current as unknown as { stop: () => void })?.stop() } catch { /* ignore */ }
    }
  }, [isInterviewActive])

  // Auto-speak AI question
  useEffect(() => {
    if (!isInterviewActive || !questions.length || !questions[currentQuestion]) return

    speakText(
      questions[currentQuestion],
      () => setAiSpeaking(true),
      () => setAiSpeaking(false)
    )
  }, [currentQuestion, isInterviewActive, questions])

  // Camera + mic
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        toast.error("Camera/microphone access denied")
      }
    }

    if (isVideoOn) startMedia()

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [isVideoOn])

  useEffect(() => {
    const s = streamRef.current
    if (!s) return
    s.getAudioTracks().forEach((t) => (t.enabled = isMicOn))
  }, [isMicOn])

  // Start interview
  const handleSetupComplete = async (data: InterviewSetupData) => {
    try {
      // Upload resume if provided
      let resumeText = ""
      if (data.resume) {
        const fd = new FormData()
        fd.append("resume", data.resume)

        const r = await fetch("/api/resume-upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        })

        if (r.ok) {
          const resJson = await r.json()
          resumeText = resJson.text || ""
        }
      }

      // Generate fallback questions based on type and difficulty
      const fallbackQuestions = generateFallbackQuestions(data.interviewType, data.difficultyLevel)
      setQuestions(fallbackQuestions)
      setCurrentQuestion(0)
      setShowSetup(false)
      setIsInterviewActive(true)
      toast.success("Interview started!")
    } catch (err) {
      console.error("Interview start failed:", err)
      toast.error("Failed to start interview. Please try again.")
    }
  }

  // End interview
  const endInterview = () => {
    setIsInterviewActive(false)
    setShowSetup(true)
    setQuestions([])
    setCurrentQuestion(0)
    setTranscript("")
    speechSynthesis.cancel()
    try { (recognitionRef.current as unknown as { stop: () => void })?.stop() } catch { /* ignore */ }
    toast.info("Interview ended")
  }

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setTranscript("")
    } else {
      toast.success("All questions completed!")
      endInterview()
    }
  }

  // Setup screen
  if (showSetup) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <PreInterviewSetup
            onComplete={handleSetupComplete}
            onCancel={() => router.push("/dashboard")}
          />
        </main>
        <Footer />
      </>
    )
  }

  // Interview UI
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* AI Interviewer */}
            <div className="space-y-4">
              <Card className="overflow-hidden border border-border">
                <div className="relative aspect-video">
                  <AIInterviewer text="" speaking={aiSpeaking} />
                </div>
              </Card>
              <Card className="border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">Current Question:</p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {questions[currentQuestion] || "Preparing question..."}
                </p>
              </Card>
            </div>

            {/* Candidate */}
            <div className="space-y-4">
              <Card className="overflow-hidden border border-border">
                <div className="relative aspect-video bg-secondary">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
              <Card className="border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">Your Response:</p>
                <p className="mt-1 text-sm text-foreground">
                  {transcript || "Listening..."}
                </p>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex gap-3">
              <Button
                variant={isMicOn ? "outline" : "secondary"}
                onClick={() => setIsMicOn((s) => !s)}
              >
                {isMicOn ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                {isMicOn ? "Mute" : "Unmute"}
              </Button>
              <Button
                variant={isVideoOn ? "outline" : "secondary"}
                onClick={() => setIsVideoOn((s) => !s)}
              >
                {isVideoOn ? <Video className="mr-2 h-4 w-4" /> : <VideoOff className="mr-2 h-4 w-4" />}
                {isVideoOn ? "Camera Off" : "Camera On"}
              </Button>
              <Button variant="destructive" onClick={endInterview}>
                <Phone className="mr-2 h-4 w-4" /> End
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <Button onClick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? (
                <>Next <ChevronRight className="ml-1 h-4 w-4" /></>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function createSpeechRecognition() {
  return null as unknown
}

function generateFallbackQuestions(type: string, difficulty: string): string[] {
  if (type === "technical") {
    if (difficulty === "easy") {
      return [
        "Tell me about yourself and your technical background.",
        "What programming languages are you most comfortable with?",
        "Can you explain the difference between a stack and a queue?",
        "What is version control and why is it important?",
        "Describe a technical project you have worked on recently.",
      ]
    }
    if (difficulty === "hard") {
      return [
        "Explain how you would design a distributed caching system.",
        "Walk me through how you would optimize a slow database query in a production system.",
        "How would you handle a race condition in a multi-threaded application?",
        "Describe the CAP theorem and its implications for system design.",
        "How would you design a real-time notification system at scale?",
      ]
    }
    return [
      "Tell me about yourself and your experience with software development.",
      "Explain the concept of RESTful APIs and how you have used them.",
      "How do you approach debugging a complex issue in production?",
      "Describe a challenging technical problem you solved recently.",
      "What is your experience with cloud services and deployment?",
    ]
  }

  // Behavioral
  if (difficulty === "easy") {
    return [
      "Tell me about yourself.",
      "Why are you interested in this role?",
      "What are your greatest strengths?",
      "How do you handle feedback from colleagues?",
      "Where do you see yourself in five years?",
    ]
  }
  if (difficulty === "hard") {
    return [
      "Describe a time when you had to make a difficult decision with incomplete information.",
      "Tell me about a time you failed and what you learned from it.",
      "How do you handle disagreements with your manager or leadership?",
      "Describe a situation where you had to lead a team through a crisis.",
      "Tell me about a time you had to balance competing priorities under pressure.",
    ]
  }
  return [
    "Tell me about a time you worked effectively in a team.",
    "Describe a challenging situation at work and how you handled it.",
    "How do you prioritize your tasks when you have multiple deadlines?",
    "Tell me about a time you showed leadership.",
    "How do you handle stress and pressure at work?",
  ]
}
