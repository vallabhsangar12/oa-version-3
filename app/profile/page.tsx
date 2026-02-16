"use client"

import type React from "react"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Calendar, Loader2, AlertCircle, Save } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

export default function ProfilePage() {
  const { data, error, isLoading } = useSWR("/api/profile", fetcher)
  const [name, setName] = useState("")
  const [nameLoaded, setNameLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Set name when data loads
  if (data?.user?.name && !nameLoaded) {
    setName(data.user.name)
    setNameLoaded(true)
  }

  const handleSave = async (e: React.FormEvent) => {
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
        toast.error(result.error || "Failed to update profile")
        return
      }

      toast.success("Profile updated successfully")
      mutate("/api/profile")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="mt-1 text-muted-foreground">Manage your account settings</p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <Card className="border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Failed to load profile</h3>
              <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
            </Card>
          )}

          {/* Profile Data */}
          {data?.user && !isLoading && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <Card className="border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{data.user.name}</h2>
                    <p className="text-muted-foreground">{data.user.email}</p>
                  </div>
                </div>
              </Card>

              {/* Edit Form */}
              <Card className="border border-border p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Edit Profile</h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="profile-name"
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

              {/* Account Info */}
              <Card className="border border-border p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since:</span>
                    <span className="font-medium text-foreground">
                      {data.user.createdAt
                        ? new Date(data.user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total interviews:</span>
                    <span className="font-medium text-foreground">{data.stats?.totalInterviews || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
