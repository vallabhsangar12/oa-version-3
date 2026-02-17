'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowRight, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical Interview' },
  { id: 'behavioral', label: 'Behavioral Interview' },
  { id: 'mixed', label: 'Mixed Interview' },
]

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', description: 'Junior level questions' },
  { id: 'medium', label: 'Medium', description: 'Mid-level questions' },
  { id: 'hard', label: 'Hard', description: 'Senior level questions' },
]

export default function InterviewSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  const [formData, setFormData] = useState({
    interviewType: 'technical',
    difficulty: 'medium',
    jobRole: '',
    experienceYears: '0',
    techStack: [] as string[],
    techInput: '',
  })

  useEffect(() => {
    // Check subscription status
    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/subscriptions/check', {
          credentials: 'include',
        })
        const data = await res.json()
        if (data.plan === 'none') {
          setHasSubscription(false)
        } else {
          setHasSubscription(true)
        }
      } catch (error) {
        console.error('[v0] Error checking subscription:', error)
        setHasSubscription(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSubscription()
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Checking subscription...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Select a Plan First</h1>
            <p className="text-muted-foreground mb-6">
              You need to select a subscription plan to start interviews.
            </p>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              Go to Pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddTech = () => {
    if (formData.techInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, prev.techInput.trim()],
        techInput: '',
      }))
    }
  }

  const handleRemoveTech = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.jobRole.trim()) {
      toast.error('Please enter a job role')
      return
    }

    setIsLoading(true)

    try {
      // Create interview session
      const res = await fetch('/api/interview-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_type: formData.interviewType,
          difficulty: formData.difficulty,
          job_role: formData.jobRole,
          experience_years: parseInt(formData.experienceYears),
          tech_stack: formData.techStack,
        }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create interview session')
        setIsLoading(false)
        return
      }

      const data = await res.json()
      toast.success('Interview session created!')
      router.push(`/interview/session/${data.session_id}`)
    } catch (error) {
      console.error('[v0] Error creating session:', error)
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Set Up Your Interview
            </h1>
            <p className="text-lg text-muted-foreground">
              Configure your interview preferences below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Interview Type */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                Interview Type
              </label>
              <div className="grid sm:grid-cols-3 gap-4">
                {INTERVIEW_TYPES.map((type) => (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.interviewType === type.id
                        ? 'border-2 border-purple-600 bg-purple-500/5'
                        : 'border border-border hover:border-purple-500/30'
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        interviewType: type.id,
                      }))
                    }
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      value={type.id}
                      checked={formData.interviewType === type.id}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          interviewType: type.id,
                        }))
                      }
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                          formData.interviewType === type.id
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-border'
                        }`}
                      >
                        {formData.interviewType === type.id && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {type.label}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                Difficulty Level
              </label>
              <div className="grid sm:grid-cols-3 gap-4">
                {DIFFICULTIES.map((diff) => (
                  <Card
                    key={diff.id}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.difficulty === diff.id
                        ? 'border-2 border-purple-600 bg-purple-500/5'
                        : 'border border-border hover:border-purple-500/30'
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: diff.id,
                      }))
                    }
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff.id}
                      checked={formData.difficulty === diff.id}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          difficulty: diff.id,
                        }))
                      }
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                          formData.difficulty === diff.id
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-border'
                        }`}
                      >
                        {formData.difficulty === diff.id && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {diff.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {diff.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Job Role */}
            <div>
              <label htmlFor="jobRole" className="block text-lg font-semibold mb-2">
                Target Job Role *
              </label>
              <Input
                id="jobRole"
                type="text"
                placeholder="e.g., Senior Full Stack Engineer"
                value={formData.jobRole}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jobRole: e.target.value,
                  }))
                }
                required
              />
            </div>

            {/* Experience Years */}
            <div>
              <label htmlFor="experienceYears" className="block text-lg font-semibold mb-2">
                Years of Experience
              </label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                max="70"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experienceYears: e.target.value,
                  }))
                }
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="techStack" className="block text-lg font-semibold mb-2">
                Preferred Tech Stack (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  id="techStack"
                  type="text"
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  value={formData.techInput}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      techInput: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTech()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTech}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {tech}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(idx)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
            >
              {isLoading ? 'Starting Interview...' : 'Start Interview'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
