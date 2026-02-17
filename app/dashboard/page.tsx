"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  Award,
  Target,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react"

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json())

export default function DashboardPage() {
  const router = useRouter()
  const { data, error, isLoading } = useSWR("/api/dashboard-stats", fetcher)

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                {data?.user ? `Welcome back, ${data.user.name}` : "Track your interview preparation progress"}
              </p>
            </div>
            <Button
              onClick={() => router.push("/interview")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> New Interview
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading your data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">Failed to load dashboard</h3>
              <p className="mt-2 text-muted-foreground">Please check your connection and try again.</p>
            </Card>
          )}

          {/* Empty State */}
          {data && !error && !isLoading && data.total_interviews === 0 && (
            <Card className="border border-border p-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No interviews yet</h3>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Start your first AI-powered interview to see your performance data here.
              </p>
              <Button
                className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/interview")}
              >
                Start Your First Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          )}

          {/* Data Loaded */}
          {data && !error && !isLoading && (
            <>
              {/* Stats Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Average Score"
                  value={data.avg_score || 0}
                  icon={<Award className="h-8 w-8 text-muted-foreground" />}
                />
                <StatCard
                  label="Total Interviews"
                  value={data.total_interviews || 0}
                  icon={<Target className="h-8 w-8 text-muted-foreground" />}
                />
                <StatCard
                  label="Best Score"
                  value={data.best_score || 0}
                  icon={<Award className="h-8 w-8 text-muted-foreground" />}
                />
                <StatCard
                  label="Last Score"
                  value={data.last_interview_score || "N/A"}
                  icon={<TrendingUp className="h-8 w-8 text-muted-foreground" />}
                />
              </div>



              {/* Recent Interviews */}
              {data.interviews?.length > 0 && (
                <Card className="border border-border p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Interviews</h3>
                  <div className="space-y-3">
                    {data.interviews.map((interview: {
                      id: string
                      created_at: string
                      interview_type: string
                      difficulty: string
                      status: string
                      score: number | null
                      job_role: string
                    }) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {interview.job_role || `${interview.interview_type} Interview`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(interview.created_at).toLocaleDateString()} - {interview.difficulty}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {interview.score !== null ? (
                              <>
                                <p className="text-2xl font-bold text-foreground">{interview.score}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </>
                            ) : (
                              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                                {interview.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="border border-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
        </div>
        {icon}
      </div>
    </Card>
  )
}
