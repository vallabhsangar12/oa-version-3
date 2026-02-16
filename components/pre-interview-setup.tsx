"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, AlertCircle, Zap, TrendingUp, Rocket, Code2, Users } from "lucide-react"

export interface InterviewSetupData {
  difficultyLevel: "easy" | "medium" | "hard"
  interviewType: "technical" | "behavioral"
  resume: File | null
  resumeName: string
}

interface PreInterviewSetupProps {
  onComplete: (data: InterviewSetupData) => void
  onCancel: () => void
}

export function PreInterviewSetup({ onComplete, onCancel }: PreInterviewSetupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium")
  const [interviewType, setInterviewType] = useState<"technical" | "behavioral">("technical")
  const [resume, setResume] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResume(file)
        setResumeName(file.name)
        setError("")
      } else {
        setError("Please upload a PDF or Word document")
      }
    }
  }

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      if (!resume) {
        setError("Please upload your resume")
        return
      }
      setIsSubmitting(true)
      try {
        await onComplete({ difficultyLevel, interviewType, resume, resumeName })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
      setError("")
    }
  }

  const difficulties = [
    { level: "easy" as const, title: "Easy", description: "Beginner-friendly questions", Icon: Zap },
    { level: "medium" as const, title: "Medium", description: "Intermediate level questions", Icon: TrendingUp },
    { level: "hard" as const, title: "Hard", description: "Advanced challenging questions", Icon: Rocket },
  ]

  const interviewTypes = [
    { type: "technical" as const, title: "Technical Interview", description: "Focus on technical skills, coding, and problem-solving", Icon: Code2 },
    { type: "behavioral" as const, title: "Behavioral Interview", description: "Focus on soft skills, experience, and communication", Icon: Users },
  ]

  return (
    <Card className="w-full max-w-2xl border border-border bg-card">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Interview Setup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Step {step} of 3 - Personalize your experience
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Cancel setup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Difficulty */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Select Difficulty Level</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a difficulty level that matches your experience.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {difficulties.map(({ level, title, description, Icon }) => (
                <button
                  key={level}
                  onClick={() => setDifficultyLevel(level)}
                  className={`rounded-lg border-2 p-5 text-left transition-all ${
                    difficultyLevel === level
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-border hover:border-purple-500/30 hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      difficultyLevel === level
                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Interview Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Select Interview Type</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the type of interview you want to practice.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {interviewTypes.map(({ type, title, description, Icon }) => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    interviewType === type
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-border hover:border-purple-500/30 hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      interviewType === type
                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Resume Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Upload Your Resume</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload your resume so our AI can generate personalized questions.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <label className="block cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/30 hover:bg-secondary/30">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="mt-1 text-sm text-muted-foreground">PDF or Word document (max 10MB)</p>
              </div>
            </label>

            {resume && (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{resumeName}</p>
                    <p className="text-xs text-muted-foreground">{(resume.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => { setResume(null); setResumeName("") }}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
            className="flex-1"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : step === 3 ? "Start Interview" : "Next"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
