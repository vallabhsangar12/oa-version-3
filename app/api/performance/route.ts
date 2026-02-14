import { type NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/postgres";

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

    const rows = await query(
      `INSERT INTO performance_reports (session_id, communication_score, technical_score, confidence_score, overall_score, strengths, improvements, recommendations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        sessionId,
        communicationScore || 0,
        technicalScore || 0,
        confidenceScore || 0,
        overallScore || 0,
        strengths || null,
        improvements || null,
        recommendations || null,
      ]
    );

    return NextResponse.json(
      { message: "Performance report saved successfully", data: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Performance POST API error:", error);
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

    const data = await queryOne(
      "SELECT * FROM performance_reports WHERE session_id = $1",
      [sessionId]
    );

    if (!data) {
      return NextResponse.json(
        { error: "Performance report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Performance GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
