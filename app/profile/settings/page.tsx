"use client"

import type React from "react"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, FileText, Loader2, AlertCircle, Save, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

export default function SettingsPage() {
  const { data, isLoading, error } = useSWR("/api/profile", fetcher)
  const [name, setName] = useState("")
  const [nameLoaded, setNameLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(data?.resume?.url || null)

  if (data?.user?.name && !nameLoaded) {
    setName(data.user.name)
    setNameLoaded(true)
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
        credentials: "include",
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to update name")
        return
      }

      toast.success("Name updated successfully")
      mutate("/api/profile")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required")
      return
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password")
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: "include",
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to change password")
        return
      }

      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resumeFile) {
      toast.error("Please select a resume file")
      return
    }

    if (resumeFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append("file", resumeFile)

      const res = await fetch("/api/resume-upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to upload resume")
        return
      }

      toast.success("Resume uploaded successfully")
      setResumeUrl(result.url)
      setResumeFile(null)
      mutate("/api/profile")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!resumeUrl) return

    try {
      const res = await fetch("/api/resume-upload", {
        method: "DELETE",
        credentials: "include",
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to delete resume")
        return
      }

      toast.success("Resume deleted successfully")
      setResumeUrl(null)
      mutate("/api/profile")
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading settings...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <Card className="border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Failed to load settings</h3>
              <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
            </Card>
          )}

          {/* Settings */}
          {data?.user && !isLoading && (
            <div className="space-y-6">
              {/* Edit Name */}
              <Card className="border border-border p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Profile Information</h3>
                <form onSubmit={handleSaveName} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="settings-name" className="text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="settings-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={data.user.email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Change Password */}
              <Card className="border border-border p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm font-medium text-foreground">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" /> Change Password
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Resume Management */}
              <Card className="border border-border p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Resume</h3>

                {resumeUrl ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Resume uploaded</p>
                            <p className="text-xs text-muted-foreground">Your resume is ready for interviews</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleDeleteResume}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <p className="mb-3 text-sm font-medium text-foreground">Replace Resume</p>
                      <form onSubmit={handleResumeUpload} className="space-y-4">
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-600 hover:file:bg-purple-500/20"
                          />
                          <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                        </div>
                        {resumeFile && (
                          <Button
                            type="submit"
                            disabled={isUploadingResume}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {isUploadingResume ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                              </>
                            ) : (
                              "Upload Resume"
                            )}
                          </Button>
                        )}
                      </form>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResumeUpload} className="space-y-4">
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-600 hover:file:bg-purple-500/20"
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                    </div>
                    <Button
                      type="submit"
                      disabled={isUploadingResume || !resumeFile}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" /> Upload Resume
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
