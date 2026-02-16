import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { face, voice, text } = body;

    if (!face || !voice || !text) {
      return NextResponse.json(
        { ok: false, error: "face, voice and text metrics are required" },
        { status: 400 }
      );
    }

    let result;
    try {
      const { computeInterviewConfidenceScore } = await import("@/lib/scoring");
      result = computeInterviewConfidenceScore({ face, voice, text });
    } catch {
      // Fallback scoring
      const faceScore = face.engagementScore || 60;
      const voiceScore = ((voice.energyScore || 60) + (voice.stabilityScore || 60)) / 2;
      const textScore = text.sentimentScore || 60;
      result = {
        score: Math.round((faceScore + voiceScore + textScore) / 3),
        breakdown: { face: faceScore, voice: Math.round(voiceScore), text: textScore },
        details: { face, voice, text },
      };
    }

    const userId = (body.userId as string) || null;
    const sessionId = (body.sessionId as string) || null;

    // Store in PostgreSQL
    try {
      const { query } = await import("@/lib/postgres");
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
    } catch {
      console.warn("PostgreSQL not available for interview-score storage");
    }

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
