import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres";

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

    const rows = await query(
      `INSERT INTO interview_sessions (user_id, title, duration_seconds, score, transcript, emotion_analysis, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        userId,
        title || "Interview Session",
        duration || 0,
        score || 0,
        transcript || null,
        emotionAnalysis ? JSON.stringify(emotionAnalysis) : null,
        feedback || null,
      ]
    );

    return NextResponse.json(
      { message: "Interview saved successfully", data: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Interviews POST API error:", error);
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

    const rows = await query(
      "SELECT * FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error("Interviews GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
