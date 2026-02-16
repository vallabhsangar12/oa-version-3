"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Loader2,
  Briefcase,
  Code2,
  Users,
  Zap,
  TrendingUp,
  Rocket,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function InterviewSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [interviewType, setInterviewType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [jobRole, setJobRole] = useState("");
  const [experience, setExperience] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setResume(file);
    toast.success("Resume uploaded");
  };

  const addTechStack = () => {
    const tag = techStackInput.trim();
    if (tag && !techStack.includes(tag)) {
      setTechStack([...techStack, tag]);
      setTechStackInput("");
    }
  };

  const removeTechStack = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechStack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interviewType) {
      toast.error("Please select an interview type");
      return;
    }
    if (!difficulty) {
      toast.error("Please select a difficulty level");
      return;
    }
    if (!jobRole.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    setIsLoading(true);

    try {
      // Upload resume first if exists
      let resumeFilename = "";
      if (resume) {
        const formData = new FormData();
        formData.append("file", resume);
        formData.append("userId", "current");

        const uploadRes = await fetch("/api/resume-upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resumeFilename = uploadData.filename;
        }
      }

      // Create interview session
      const res = await fetch("/api/interview/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType,
          difficulty,
          jobRole: jobRole.trim(),
          experience: parseInt(experience) || 0,
          techStack,
          resumeFilename,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create session");
        return;
      }

      toast.success("Interview session created");
      router.push(`/interview/session/${data.sessionId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interview Setup</h1>
            <p className="text-muted-foreground">
              Configure your interview session preferences before starting.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Interview Type */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Interview Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setInterviewType("technical")}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      interviewType === "technical"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Code2
                      className={`w-8 h-8 mb-3 ${
                        interviewType === "technical"
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                    <h3 className="font-semibold mb-1">Technical</h3>
                    <p className="text-sm text-muted-foreground">
                      Focus on technical skills, coding, and problem-solving
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterviewType("behavioral")}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      interviewType === "behavioral"
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Users
                      className={`w-8 h-8 mb-3 ${
                        interviewType === "behavioral"
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                    <h3 className="font-semibold mb-1">Behavioral</h3>
                    <p className="text-sm text-muted-foreground">
                      Focus on soft skills, experience, and communication
                    </p>
                  </button>
                </div>
              </Card>

              {/* Difficulty */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Difficulty Level</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      value: "easy",
                      label: "Easy",
                      desc: "Beginner-friendly questions",
                      Icon: Zap,
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      desc: "Intermediate level",
                      Icon: TrendingUp,
                    },
                    {
                      value: "hard",
                      label: "Hard",
                      desc: "Advanced challenges",
                      Icon: Rocket,
                    },
                  ].map(({ value, label, desc, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDifficulty(value)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        difficulty === value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 ${
                          difficulty === value
                            ? "text-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                      <h3 className="font-semibold text-sm">{label}</h3>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Job Details */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Job Details</h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="jobRole" className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Job Role
                    </label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Full Stack Developer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">
                      Years of Experience
                    </label>
                    <Select
                      value={experience}
                      onValueChange={setExperience}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Fresher (0 years)</SelectItem>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="7">7+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="techStack" className="text-sm font-medium">
                      Preferred Tech Stack
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="techStack"
                        placeholder="e.g., React, Node.js"
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTechStack}
                      >
                        Add
                      </Button>
                    </div>
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {techStack.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTechStack(tag)}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Resume Upload */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Resume Upload</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your resume (PDF only, max 5MB) for personalized
                  questions.
                </p>

                {resume ? (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{resume.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(resume.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setResume(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF only (max 5MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  "Continue to Interview"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
