"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Redirect old interview-ui path to new interview/setup
export default function InterviewUiRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/interview/setup");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to interview setup...</p>
    </div>
  );
}
