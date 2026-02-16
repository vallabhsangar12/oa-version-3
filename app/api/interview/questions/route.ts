import { NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";
import { analyzeResume } from "@/utils/resumeAnalyzer";

export async function POST(req: Request) {
  const { resumeId, sessionId } = await req.json();
  const db = await getDb();

  const resume = await db.collection("resumes").findOne({ _id: resumeId });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const analysis = analyzeResume(resume.rawText);

  const questions = [
    `Explain your experience with ${analysis.skills[0] || "your core skills"}`,
    `Describe a project related to ${analysis.role}`,
    `What challenges did you face in your last project?`,
  ];

  await db.collection("interview_questions").insertOne({
    sessionId,
    resumeId,
    role: analysis.role,
    skills: analysis.skills,
    questions,
    createdAt: new Date(),
  });

  return NextResponse.json({ questions, analysis });
}