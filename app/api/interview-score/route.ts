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

    const userId = body.userId || null;
    const sessionId = body.sessionId || null;

    // Store in PostgreSQL
    try {
      await query(
        `INSERT INTO interview_results (user_id, score, summary)
         VALUES ($1, $2, $3)`,
        [
          userId,
          result.score,
          JSON.stringify({
            sessionId,
            breakdown: result.breakdown,
            face: result.details.face,
            voice: result.details.voice,
            text: result.details.text,
          }),
        ]
      );
    } catch (dbErr) {
      console.error("PostgreSQL interview_results insert error:", dbErr);
    }

    return NextResponse.json({
      ok: true,
      score: result.score,
      breakdown: result.breakdown,
      details: result.details,
    });
  } catch (err) {
    console.error("Error in /api/interview-score:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
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
