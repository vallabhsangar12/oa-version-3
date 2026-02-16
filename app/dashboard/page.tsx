"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target,
  Award,
  Clock,
  Play,
  FileText,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  createdAt: string;
}

interface InterviewSetup {
  _id: string;
  interviewType: string;
  difficultyLevel: string;
  jobRole?: string;
  status?: string;
  createdAt: string;
}

interface InterviewSession {
  _id: string;
  title?: string;
  score?: number;
  durationSeconds?: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [setups, setSetups] = useState<InterviewSetup[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, historyRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/interview/history"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setSetups(historyData.setups || []);
          setSessions(historyData.sessions || []);
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalInterviews = setups.length;
  const completedSessions = sessions.filter((s) => s.score && s.score > 0);
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
            completedSessions.length
        )
      : 0;
  const lastScore =
    completedSessions.length > 0 ? completedSessions[0]?.score || 0 : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 lg:col-span-2" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-muted-foreground">
              Track your interview preparation progress and start new sessions.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Interviews
                  </p>
                  <p className="text-3xl font-bold">{totalInterviews}</p>
                </div>
                <Target className="h-10 w-10 text-accent opacity-60" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Average Score
                  </p>
                  <p className="text-3xl font-bold">
                    {averageScore > 0 ? averageScore : "--"}
                  </p>
                </div>
                <Award className="h-10 w-10 text-accent opacity-60" />
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Score
                  </p>
                  <p className="text-3xl font-bold">
                    {lastScore > 0 ? lastScore : "--"}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-accent opacity-60" />
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Previous Interviews */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Previous Interviews</h2>
                </div>

                {setups.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No interviews yet. Start your first one!
                    </p>
                    <Link href="/interview/setup">
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Play className="mr-2 h-4 w-4" /> Start Interview
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {setups.slice(0, 10).map((setup) => (
                      <Link
                        key={setup._id}
                        href={`/interview/session/${setup._id}`}
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-sm capitalize">
                                {setup.interviewType} - {setup.difficultyLevel}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {setup.jobRole && `${setup.jobRole} - `}
                                {new Date(setup.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Start Interview Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">New Interview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up a new interview session with your preferences.
                </p>
                <Link href="/interview/setup">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Play className="mr-2 h-4 w-4" /> Start Interview
                  </Button>
                </Link>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Account</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate ml-2 max-w-[180px]">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "--"}
                    </span>
                  </div>
                </div>
                <Link href="/profile" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
