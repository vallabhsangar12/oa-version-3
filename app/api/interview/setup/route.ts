import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import dbConnect, { createPreInterviewSetup } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const payload = await getServerUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { interviewType, difficulty, jobRole, experience, techStack, resumeFilename } = body;

    if (!interviewType || !difficulty || !jobRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const session = await createPreInterviewSetup(
      payload.userId,
      difficulty,
      interviewType,
      undefined,
      resumeFilename || undefined,
      undefined
    );

    // Save the extra fields
    session.jobRole = jobRole;
    session.experience = experience || 0;
    session.techStack = techStack || [];
    await session.save();

    return NextResponse.json(
      {
        message: "Interview session created",
        sessionId: session._id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Interview setup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
