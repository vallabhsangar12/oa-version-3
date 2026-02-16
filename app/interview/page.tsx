"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  PreInterviewSetup,
  type InterviewSetupData,
} from "@/components/pre-interview-setup"
import { toast } from "sonner"

export default function InterviewSetupPage() {
  const router = useRouter()

  const handleSetupComplete = async (data: InterviewSetupData) => {
    try {
      // Upload resume if provided
      let resumeText = ""
      if (data.resume) {
        const fd = new FormData()
        fd.append("resume", data.resume)

        const uploadRes = await fetch("/api/resume-upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        })

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json()
          resumeText = uploadJson.text || ""
        }
      }

      // Save setup to session storage for the interview-ui page
      const setupData = {
        difficultyLevel: data.difficultyLevel,
        interviewType: data.interviewType,
        resumeText,
        resumeName: data.resumeName,
      }
      sessionStorage.setItem("interviewSetup", JSON.stringify(setupData))

      toast.success("Setup complete! Starting interview...")
      router.push("/interview-ui")
    } catch {
      toast.error("Failed to set up interview. Please try again.")
    }
  }

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
