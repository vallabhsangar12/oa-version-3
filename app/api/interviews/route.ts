import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      duration,
      score,
      transcript,
      emotionAnalysis,
      feedback,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("interview_sessions").insertOne({
      userId,
      title: title || "Interview Session",
      durationSeconds: duration || 0,
      score: score || 0,
      transcript: transcript || null,
      emotionAnalysis: emotionAnalysis || null,
      feedback: feedback || null,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Interview saved successfully",
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Interviews POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const data = await db
      .collection("interview_sessions")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Interviews GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
