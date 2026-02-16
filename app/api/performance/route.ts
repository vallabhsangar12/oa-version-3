import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      communicationScore,
      technicalScore,
      confidenceScore,
      overallScore,
      strengths,
      improvements,
      recommendations,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("performance_reports").insertOne({
      sessionId,
      communicationScore: communicationScore || 0,
      technicalScore: technicalScore || 0,
      confidenceScore: confidenceScore || 0,
      overallScore: overallScore || 0,
      strengths: strengths || null,
      improvements: improvements || null,
      recommendations: recommendations || null,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Performance report saved successfully",
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Performance POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const data = await db
      .collection("performance_reports")
      .findOne({ sessionId });

    if (!data) {
      return NextResponse.json(
        { error: "Performance report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Performance GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
