import { NextResponse } from "next/server";

// ✅ Fast, resume-driven, difficulty-aware (NO LLM, NO DELAY)
function generateFastQuestions(
  resumeText: string,
  interviewType: string,
  difficulty: string
) {
  const skills =
    resumeText.match(/(JavaScript|TypeScript|Python|Java|React|Node|Next|ML|AI|SQL|MongoDB|AWS|Docker)/gi) || [];

  const topSkill = skills[0] || "your core skill";

  if (difficulty === "easy") {
    return [
      "Introduce yourself briefly.",
      `What is ${topSkill}?`,
      "Tell me about one project you worked on.",
      "What technologies are you most comfortable with?",
      "What are your career goals?",
    ];
  }

  if (difficulty === "medium") {
    return [
      "Give a short overview of your professional background.",
      `How did you use ${topSkill} in one of your projects?`,
      "Describe a technical challenge you faced.",
      "How did you solve that problem?",
      "What improvements would you make to your project?",
    ];
  }

  // hard
  return [
    `Explain a complex project where you used ${topSkill}.`,
    `What design decisions did you take in your ${interviewType} project?`,
    "How would you scale your solution?",
    "What trade-offs did you consider?",
    "How do you ensure performance and reliability?",
  ];
}

export async function POST(req: Request) {
  const {
    resumeText = "",
    difficulty = "medium",
    interviewType = "general",
  } = await req.json();

  const questions = generateFastQuestions(
    resumeText,
    interviewType,
    difficulty
  );

  return NextResponse.json({ questions });
}
