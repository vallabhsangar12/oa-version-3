import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

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

    const db = await getDb();
    const result = await db.collection("pre_interview_setup").insertOne({
      userId,
      difficultyLevel,
      interviewType,
      resumeUrl: resumeUrl || null,
      resumeFilename: resumeFilename || null,
      resumeContent: resumeContent || null,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Pre-interview setup saved successfully",
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pre-interview setup error:", error);
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
      .collection("pre_interview_setup")
      .findOne({ userId }, { sort: { createdAt: -1 } });

    if (!data) {
      return NextResponse.json(
        { error: "No setup found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Pre-interview setup GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
