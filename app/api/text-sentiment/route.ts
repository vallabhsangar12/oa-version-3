import { NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

const POSITIVE_WORDS = [
  "good", "great", "excellent", "confident", "happy", "excited", "positive",
  "strong", "capable", "motivated", "interested", "curious", "reliable",
];
const NEGATIVE_WORDS = [
  "bad", "weak", "nervous", "anxious", "afraid", "worried", "negative",
  "stressed", "confused", "unsure", "doubt", "problem", "issue",
];

function computeSentimentScore(text: string): number {
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
    const payload = await req.json();

    const text: string = payload.text || "";
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { ok: false, error: "Text is required" },
        { status: 400 }
      );
    }

    const sentimentScore = computeSentimentScore(text);

    const userId = (payload.userId as string) || null;
    const sessionId = (payload.sessionId as string) || null;

    const db = await getDb();
    await db.collection("text_sentiment_logs").insertOne({
      userId,
      sessionId,
      text,
      sentimentScore,
      createdAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      sentimentScore,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in /api/text-sentiment:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "text-sentiment endpoint running",
  });
}
