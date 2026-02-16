"use client";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/utils/auth";
import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIInterviewer } from "@/components/ai-interviewer";
import { speakText } from "@/src/utils/browserTTS";
import {
  PreInterviewSetup,
  type InterviewSetupData,
} from "@/components/pre-interview-setup";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
} from "lucide-react";

export default function InterviewPage() {
  const router = useRouter();

  useEffect(() => {
  if (!isLoggedIn()) {
    alert("⚠ Login required to start interview");
    router.replace("/login");
  }
}, []);
  // ------------------------------------------------------------
  // 🔑 Core State
  // ------------------------------------------------------------
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // ✅ FIX: questions must be state
  const [questions, setQuestions] = useState<string[]>([]);

  // ------------------------------------------------------------
  // 🎥 Media refs
  // ------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ------------------------------------------------------------
  // 🎙 Speech recognition
  // ------------------------------------------------------------
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState("");

  // ------------------------------------------------------------
  // UI toggles
  // ------------------------------------------------------------
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // ------------------------------------------------------------
  // 🎙 Browser Speech-to-Text
  // ------------------------------------------------------------
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      speechSynthesis.cancel();
      setAiSpeaking(false);
    };

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);

      if (sessionId) {
        fetch("/api/qa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            type: "answer",
            text,
            ts: Date.now(),
          }),
        });
      }
    };

    recognitionRef.current = recognition;
  }, [sessionId]);

  useEffect(() => {
    if (isInterviewActive) recognitionRef.current?.start();
    else recognitionRef.current?.stop();
  }, [isInterviewActive]);

  // ------------------------------------------------------------
  // 🔊 Auto-speak AI question
  // ------------------------------------------------------------
  useEffect(() => {
    if (
      !isInterviewActive ||
      !questions.length ||
      !questions[currentQuestion]
    )
      return;

    const text = questions[currentQuestion];

    if (sessionId) {
      fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type: "question",
          text,
          ts: Date.now(),
        }),
      });
    }

    speakText(
      text,
      () => setAiSpeaking(true),
      () => setAiSpeaking(false)
    );
  }, [currentQuestion, isInterviewActive, questions, sessionId]);

  // ------------------------------------------------------------
  // 📸 Emotion capture → Python → MongoDB
  // ------------------------------------------------------------
  const sendFrameToPython = async () => {
    if (!videoRef.current || !sessionId) return;

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    const pyRes = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!pyRes.ok) return;

    const metrics = await pyRes.json();

    await fetch("/api/emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        batch: [
          {
            ts: Date.now() / 1000,
            label: metrics.label,
            confidence: metrics.confidence,
          },
        ],
      }),
    });
  };

    // 🔊 Speak first question when interview starts
    useEffect(() => {
    if (!isInterviewActive) return;
    if (!questions.length) return;

    const q = questions[currentQuestion];

    if (!q) return;

    speakText(
      q,
      () => setAiSpeaking(true),
      () => setAiSpeaking(false)
    );
  }, [currentQuestion, isInterviewActive, questions]);

  // ------------------------------------------------------------
  // 🎥 Camera + mic
  // ------------------------------------------------------------
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {}
    }

    if (isVideoOn) startMedia();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [isVideoOn]);

  useEffect(() => {
    const s = streamRef.current;
    if (!s) return;
    s.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
  }, [isMicOn]);

  // ------------------------------------------------------------
  // 🎬 Start interview
// ------------------------------------------------------------
const handleSetupComplete = async (data: InterviewSetupData) => {
  try {
    // 0️⃣ Create interview session
    const sessionRes = await fetch("/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setup: data }),
    });

    if (!sessionRes.ok) {
      throw new Error("Session creation failed");
    }

    const sessionJson = await sessionRes.json();
    const newSessionId: string = sessionJson.sessionId;

    setSessionId(newSessionId);

    // --------------------
    // 1️⃣ Parse resume
    // --------------------
    let resumeText = "";

    if (data.resume) {
      const fd = new FormData();
      fd.append("resume", data.resume);
      fd.append("sessionId", newSessionId);

      const r = await fetch("/api/resume/parse", {
        method: "POST",
        body: fd,
      });

      if (r.ok) {
        const resJson = await r.json();
        resumeText = resJson.text || "";
      }
    }
    // --------------------
    // 2️⃣ Generate AI questions (background-safe)
    // --------------------
      const qaRes = await fetch("/api/qa/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: newSessionId,
        resumeText,
        difficulty: data.difficultyLevel,
        interviewType: data.interviewType,
      }),
    });

    let generatedQuestions: string[] = [];

    if (qaRes.ok) {
      const qaJson = await qaRes.json();
      generatedQuestions = qaJson.questions || [];
    }
    
    setQuestions(generatedQuestions);
    setCurrentQuestion(0);

    // --------------------
    // 4️⃣ Start interview UI
    // --------------------
    setShowSetup(false);
    setIsInterviewActive(true);

  } catch (err) {
    console.error("❌ Interview start failed:", err);
    alert("Failed to start interview. Please try again.");
  }
};

// 🛑 End interview
// ------------------------------------------------------------
  const endInterview = () => {
  setIsInterviewActive(false);
  setShowSetup(true);
  setQuestions([]);
  setCurrentQuestion(0);
  setTranscript("");

  // stop AI speech
  speechSynthesis.cancel();

  // stop speech recognition
  recognitionRef.current?.stop();
};

// ➡ Next question
// ------------------------------------------------------------
const nextQuestion = () => {
  setCurrentQuestion((prev) =>
    prev < questions.length - 1 ? prev + 1 : prev
  );
};

  // ------------------------------------------------------------
  // 🟦 Setup screen
  // ------------------------------------------------------------
  if (showSetup) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen py-12">
          <PreInterviewSetup
            onComplete={handleSetupComplete}
            onCancel={() => {
              setSessionId(null);
              setIsInterviewActive(false);
            }}
          />
        </main>
        <Footer />
      </>
    );
  }

  // ------------------------------------------------------------
// 🟪 Interview UI (AI + Candidate same size, text beside AI)
// ------------------------------------------------------------
return (
  <>
    <Navbar />
    <main className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🤖 AI Interviewer */}
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="relative bg-black aspect-video rounded-lg overflow-hidden flex items-center justify-center">
              <AIInterviewer
                text=""               // ❌ no text inside avatar
                speaking={aiSpeaking}
              />
            </div>
          </Card>

          {/* ✅ Question text shown OUTSIDE avatar */}
          <Card className="p-4">
            <p className="text-base font-medium">
              {questions[currentQuestion] || ""}
            </p>
          </Card>
        </div>

        {/* 👤 Candidate */}
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          <Card className="p-3">
            <p className="text-sm text-muted-foreground">
              🎙 {transcript || "Listening..."}
            </p>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={() => setIsMicOn((s) => !s)} variant="outline">
          {isMicOn ? <Mic /> : <MicOff />} Mic
        </Button>

        <Button onClick={() => setIsVideoOn((s) => !s)} variant="outline">
          {isVideoOn ? <Video /> : <VideoOff />} Video
        </Button>

        <Button variant="destructive" onClick={endInterview}>
          <Phone className="mr-2 h-5 w-5" /> End
        </Button>
      </div>

      <div className="flex justify-between mt-6 max-w-6xl mx-auto">
        <span>
          Question {currentQuestion + 1} / {questions.length}
        </span>
        <Button onClick={nextQuestion}>Next</Button>
      </div>
    </main>
    <Footer />
  </>
);
}