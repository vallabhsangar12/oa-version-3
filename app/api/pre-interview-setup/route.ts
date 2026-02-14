import { type NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      difficultyLevel,
      interviewType,
      resumeUrl,
      resumeFilename,
      resumeContent,
    } = body;

    if (!userId || !difficultyLevel || !interviewType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validDifficulties = ["easy", "medium", "hard"];
    const validTypes = ["technical", "behavioral"];

    if (!validDifficulties.includes(difficultyLevel)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      );
    }

    if (!validTypes.includes(interviewType)) {
      return NextResponse.json(
        { error: "Invalid interview type" },
        { status: 400 }
      );
    }

    const rows = await query(
      `INSERT INTO pre_interview_setup (user_id, difficulty_level, interview_type, resume_url, resume_filename, resume_content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        difficultyLevel,
        interviewType,
        resumeUrl || null,
        resumeFilename || null,
        resumeContent || null,
      ]
    );

    return NextResponse.json(
      { message: "Pre-interview setup saved successfully", data: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pre-interview setup API error:", error);
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

    const data = await queryOne(
      "SELECT * FROM pre_interview_setup WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (!data) {
      return NextResponse.json(
        { error: "No pre-interview setup found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Pre-interview GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
