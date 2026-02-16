import { NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";
import { query } from "@/lib/postgres";
import { computeInterviewConfidenceScore } from "@/lib/scoring";

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

    const db = await getDb();

    // Get latest face performance from MongoDB
    const faceReport = await db
      .collection("performance_reports")
      .findOne({ sessionId }, { sort: { createdAt: -1 } });

    // Get latest voice report from MongoDB
    const voiceReport = await db
      .collection("voice_reports")
      .findOne({ sessionId }, { sort: { createdAt: -1 } });

    let sentimentScore = 60;
    if (transcript) {
      sentimentScore = computeTextSentiment(transcript);
    }

    const finalScore = computeInterviewConfidenceScore({
      face: { engagementScore: faceReport?.engagementScore || 60 },
      voice: {
        energyScore: voiceReport?.energyScore || 60,
        stabilityScore: voiceReport?.stabilityScore || 60,
      },
      text: { sentimentScore },
    });

    // Store final score in PostgreSQL
    await query(
      `INSERT INTO interview_results (user_id, session_id, score, summary, breakdown, face_metrics, voice_metrics, text_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        sessionId,
        finalScore.score,
        `Final interview score: ${finalScore.score}/100`,
        JSON.stringify(finalScore.breakdown),
        JSON.stringify(finalScore.details.face),
        JSON.stringify(finalScore.details.voice),
        JSON.stringify(finalScore.details.text),
      ]
    );

    // Also log to MongoDB for analytics
    await db.collection("interview_logs").insertOne({
      sessionId,
      userId: userId || null,
      transcript: transcript || null,
      finalScore: finalScore.score,
      breakdown: finalScore.breakdown,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, ...finalScore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
