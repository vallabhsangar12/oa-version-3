import { getDb } from "@/utils/mongodb";

interface InterviewLogEntry {
  userId: string;
  interviewId: string;
  transcript?: string;
  emotions?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function logInterviewData(entry: InterviewLogEntry): Promise<string> {
  const db = await getDb();
  const collection = db.collection("interview_logs");

  const result = await collection.insertOne({
    ...entry,
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}

export async function getInterviewLogs(userId: string) {
  const db = await getDb();
  const collection = db.collection("interview_logs");

  return collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getInterviewLogById(interviewId: string) {
  const db = await getDb();
  const collection = db.collection("interview_logs");

  return collection.findOne({ interviewId });
}

export async function logEmotionBatch(data: {
  userId: string;
  sessionId: string;
  emotions: Record<string, unknown>[];
}): Promise<string> {
  const db = await getDb();
  const result = await db.collection("emotion_batches").insertOne({
    ...data,
    timestamp: new Date(),
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logTextSentiment(data: {
  userId?: string;
  sessionId?: string;
  text: string;
  sentiment: Record<string, unknown>;
  confidence?: number;
}): Promise<string> {
  const db = await getDb();
  const result = await db.collection("text_sentiment_logs").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logVoiceEmotion(data: {
  userId?: string;
  sessionId?: string;
  emotions: Record<string, unknown>[];
  audioMetadata?: Record<string, unknown>;
}): Promise<string> {
  const db = await getDb();
  const result = await db.collection("voice_emotion_logs").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function logDebugSession(data: {
  userId?: string;
  sessionId?: string;
  action: string;
  details: Record<string, unknown>;
}): Promise<string> {
  const db = await getDb();
  const result = await db.collection("debug_logs").insertOne({
    ...data,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}
