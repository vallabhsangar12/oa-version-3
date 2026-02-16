"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isLoggedIn } from "@/src/utils/auth";
import {
  ArrowRight,
  Brain,
  Video,
  Mic,
  TrendingUp,
  Award,
  Sparkles,
  ChevronDown,
  Play,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Resume-Based Questioning",
      description:
        "AI analyzes your resume to generate personalized interview questions tailored to your skills, experience, and target role.",
    },
    {
      icon: Video,
      title: "Live AI Video Interview",
      description:
        "Practice with our AI interviewer through live video sessions that feel like real human interactions with adaptive follow-up questions.",
    },
    {
      icon: Sparkles,
      title: "Facial Emotion Recognition",
      description:
        "Advanced computer vision tracks confidence, nervousness, and engagement through real-time facial expression analysis.",
    },
    {
      icon: Mic,
      title: "Speech Pattern Analysis",
      description:
        "Analyze speech pace, filler words, pauses, and tone to provide comprehensive communication feedback.",
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scoring System",
      description:
        "Get scored on multiple dimensions including answer quality, emotional stability, and communication skills.",
    },
    {
      icon: Award,
      title: "Adaptive Learning Modules",
      description:
        "Personalized training content and practice modules based on your performance and improvement areas.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          <div className="absolute inset-0 -z-10">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&h=900&fit=crop"
              alt=""
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/90 to-indigo-900/95" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-8 text-white">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
                Master Your Interviews with AI
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto text-balance">
                Get real-time feedback, emotion analysis, and personalized
                coaching to ace your next interview.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-blue-50 font-semibold shadow-lg transition-all"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent transition-all"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                Powerful Features
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to prepare for your dream job.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="p-8 group cursor-pointer border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                  >
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERVIEW SECTION */}
        <section className="py-20 sm:py-32 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
                AI Interview Practice
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Practice with our advanced AI interviewer that provides
                real-time feedback.
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
              <div className="relative aspect-video bg-secondary flex items-center justify-center group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=800&fit=crop"
                  alt="Professional interviewer at desk"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-purple-900/30 group-hover:bg-purple-900/20 transition-colors" />
                <button
                  onClick={handleGetStarted}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all group-hover:scale-110">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white text-xl font-semibold">
                      Start Interview
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="py-20 sm:py-32 bg-card">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              About OneselfAI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Empowering professionals to ace their interviews with AI-powered
              preparation.
            </p>
            <Link href="/about">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                Learn More About Us
              </Button>
            </Link>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 sm:py-32 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance text-white">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of professionals who have improved their interview
              performance with OneselfAI.
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-blue-50 font-semibold shadow-lg transition-all"
              onClick={handleGetStarted}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
