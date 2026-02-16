import { getDb } from "@/utils/mongodb";

interface InterviewLog {
  userId?: string | null;
  interviewId?: string | null;
  sessionId?: string | null;
  transcript?: string | null;
  emotions?: Record<string, unknown> | null;
  performance?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export async function logInterviewSession(data: InterviewLog): Promise<string> {
  const db = await getDb();
  const result = await db.collection("interview_logs").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logEmotionBatch(
  sessionId: string | null,
  userId: string | null,
  batch: unknown[],
  metrics: Record<string, unknown>
): Promise<string> {
  const db = await getDb();
  const result = await db.collection("emotion_batches").insertOne({
    sessionId,
    userId,
    batch,
    metrics,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logVoiceBatch(
  sessionId: string | null,
  userId: string | null,
  batch: unknown[],
  metrics: Record<string, unknown>
): Promise<string> {
  const db = await getDb();
  const result = await db.collection("voice_batches").insertOne({
    sessionId,
    userId,
    batch,
    metrics,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logTextSentiment(
  sessionId: string | null,
  userId: string | null,
  text: string,
  sentimentScore: number
): Promise<string> {
  const db = await getDb();
  const result = await db.collection("text_sentiment_logs").insertOne({
    sessionId,
    userId,
    text,
    sentimentScore,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logDebugEvent(
  sessionId: string | null,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.collection("debug_logs").insertOne({
    sessionId,
    event,
    data,
    createdAt: new Date(),
  });
}
