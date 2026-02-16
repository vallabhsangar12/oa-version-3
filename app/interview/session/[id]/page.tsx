"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  ArrowLeft,
  Code2,
  Users,
  Briefcase,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface SessionData {
  _id: string;
  interviewType: string;
  difficultyLevel: string;
  jobRole?: string;
  experience?: number;
  techStack?: string[];
  resumeFilename?: string;
  status?: string;
  createdAt: string;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/interview/session/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
        } else {
          toast.error("Session not found");
          router.push("/dashboard");
        }
      } catch {
        toast.error("Failed to load session");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchSession();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center py-12 px-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This interview session does not exist or has been removed.
            </p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-2">Interview Session</h1>
            <p className="text-muted-foreground">
              Review your interview configuration before starting.
            </p>
          </div>

          {/* Session Details */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Interview Type */}
              <div className="flex items-start gap-3">
                {session.interviewType === "technical" ? (
                  <Code2 className="w-5 h-5 text-accent mt-0.5" />
                ) : (
                  <Users className="w-5 h-5 text-accent mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Interview Type
                  </p>
                  <p className="font-medium capitalize">
                    {session.interviewType}
                  </p>
                </div>
              </div>

              {/* Difficulty */}
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">
                    {session.difficultyLevel}
                  </p>
                </div>
              </div>

              {/* Job Role */}
              {session.jobRole && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Role</p>
                    <p className="font-medium">{session.jobRole}</p>
                  </div>
                </div>
              )}

              {/* Experience */}
              {session.experience !== undefined && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {session.experience === 0
                        ? "Fresher"
                        : `${session.experience} year${session.experience > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {session.resumeFilename && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resume</p>
                    <p className="font-medium text-sm">
                      {session.resumeFilename}
                    </p>
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-sm">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {session.techStack && session.techStack.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Tech Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {session.techStack.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Start Interview Button */}
          <Card className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to Start?</h2>
              <p className="text-muted-foreground text-sm">
                The AI interviewer will ask you questions based on your
                configuration. This feature is coming soon.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled
            >
              <Play className="mr-2 h-5 w-5" /> Start Interview (Coming Soon)
            </Button>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
