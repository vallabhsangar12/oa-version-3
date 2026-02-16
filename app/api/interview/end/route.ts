import { NextResponse } from "next/server";

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

    let faceEngagement = 60;
    let voiceEnergy = 60;
    let voiceStability = 60;

    // Try MongoDB for face/voice data
    try {
      const { getDb } = await import("@/utils/mongodb");
      const db = await getDb();

      const faceReport = await db
        .collection("performance_reports")
        .findOne({ sessionId }, { sort: { createdAt: -1 } });

      const voiceReport = await db
        .collection("voice_reports")
        .findOne({ sessionId }, { sort: { createdAt: -1 } });

      if (faceReport?.engagementScore) faceEngagement = faceReport.engagementScore;
      if (voiceReport?.energyScore) voiceEnergy = voiceReport.energyScore;
      if (voiceReport?.stabilityScore) voiceStability = voiceReport.stabilityScore;
    } catch {
      console.warn("MongoDB not available for interview/end");
    }

    let sentimentScore = 60;
    if (transcript) {
      sentimentScore = computeTextSentiment(transcript);
    }

    // Compute score
    let finalScore;
    try {
      const { computeInterviewConfidenceScore } = await import("@/lib/scoring");
      finalScore = computeInterviewConfidenceScore({
        face: { engagementScore: faceEngagement },
        voice: { energyScore: voiceEnergy, stabilityScore: voiceStability },
        text: { sentimentScore },
      });
    } catch {
      finalScore = {
        score: Math.round((faceEngagement + voiceEnergy + voiceStability + sentimentScore) / 4),
        breakdown: { face: faceEngagement, voice: Math.round((voiceEnergy + voiceStability) / 2), text: sentimentScore },
        details: { face: { engagementScore: faceEngagement }, voice: { energyScore: voiceEnergy, stabilityScore: voiceStability }, text: { sentimentScore } },
      };
    }

    // Store in PostgreSQL
    try {
      const { query } = await import("@/lib/postgres");
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
    } catch {
      console.warn("PostgreSQL not available for interview/end result storage");
    }

    // Also log to MongoDB
    try {
      const { getDb } = await import("@/utils/mongodb");
      const db = await getDb();
      await db.collection("interview_logs").insertOne({
        sessionId,
        userId: userId || null,
        transcript: transcript || null,
        finalScore: finalScore.score,
        breakdown: finalScore.breakdown,
        createdAt: new Date(),
      });
    } catch {
      console.warn("MongoDB not available for interview log");
    }

    return NextResponse.json({ ok: true, ...finalScore });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
