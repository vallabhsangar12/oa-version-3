import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { computeInterviewConfidenceScore } from "@/lib/scoring";
import { logInterviewData } from "@/lib/interview-logger";

function computeTextSentiment(text: string): number {
  if (!text || typeof text !== "string") return 60;
  const POSITIVE_WORDS = [
    "good", "great", "excellent", "confident", "happy", "excited", "positive",
    "strong", "capable", "motivated", "interested", "curious", "reliable",
  ];
  const NEGATIVE_WORDS = [
    "bad", "weak", "nervous", "anxious", "afraid", "worried", "negative",
    "stressed", "confused", "unsure", "doubt", "problem", "issue",
  ];
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  let pos = 0;
  let neg = 0;
  for (const t of tokens) {
    if (POSITIVE_WORDS.includes(t)) pos++;
    if (NEGATIVE_WORDS.includes(t)) neg++;
  }
  const total = pos + neg;
  if (total === 0) return 60;
  const ratio = (pos - neg) / total;
  const score = Math.round(((ratio + 1) / 2) * 100);
  return Math.max(0, Math.min(100, score));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, transcript, userId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Get face metrics from performance_reports
    const faceRows = await query(
      "SELECT * FROM performance_reports WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1",
      [sessionId]
    );

    let sentimentScore = 60;
    if (transcript) {
      sentimentScore = computeTextSentiment(transcript);
    }

    const faceRow = faceRows[0] as Record<string, unknown> | undefined;

    const finalScore = computeInterviewConfidenceScore({
      face: {
        engagementScore:
          (faceRow?.confidence_score as number) || 60,
      },
      voice: {
        energyScore: 60,
        stabilityScore: 60,
      },
      text: { sentimentScore },
    });

    // Store interview result in PostgreSQL
    await query(
      `INSERT INTO interview_results (user_id, score, summary)
       VALUES ($1, $2, $3)`,
      [
        userId || null,
        finalScore.score,
        JSON.stringify({
          breakdown: finalScore.breakdown,
          details: finalScore.details,
        }),
      ]
    );

    // Log to MongoDB for analytics
    if (userId) {
      await logInterviewData({
        userId,
        interviewId: sessionId,
        transcript: transcript || undefined,
        performance: {
          score: finalScore.score,
          breakdown: finalScore.breakdown,
        },
      }).catch((err: unknown) =>
        console.error("MongoDB interview log error:", err)
      );
    }

    return NextResponse.json({ ok: true, ...finalScore });
  } catch (err) {
    console.error("Interview end error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
