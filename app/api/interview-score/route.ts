import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import {
  computeInterviewConfidenceScore,
  type FaceMetrics,
  type VoiceMetrics,
  type TextMetrics,
} from "@/lib/scoring";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const face: FaceMetrics = body.face;
    const voice: VoiceMetrics = body.voice;
    const text: TextMetrics = body.text;

    if (!face || !voice || !text) {
      return NextResponse.json(
        { ok: false, error: "face, voice and text metrics are required" },
        { status: 400 }
      );
    }

    const result = computeInterviewConfidenceScore({ face, voice, text });

    const userId = (body.userId as string) || null;
    const sessionId = (body.sessionId as string) || null;

    // Store in PostgreSQL interview_results table
    await query(
      `INSERT INTO interview_results (user_id, session_id, score, summary, breakdown, face_metrics, voice_metrics, text_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        sessionId,
        result.score,
        `Interview score: ${result.score}/100`,
        JSON.stringify(result.breakdown),
        JSON.stringify(result.details.face),
        JSON.stringify(result.details.voice),
        JSON.stringify(result.details.text),
      ]
    );

    return NextResponse.json({
      ok: true,
      score: result.score,
      breakdown: result.breakdown,
      details: result.details,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/interview-score:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "interview-score endpoint running",
  });
}
