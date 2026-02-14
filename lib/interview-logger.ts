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

export async function logDebugSession(data: {
  userId?: string;
  sessionId?: string;
  action: string;
  details: Record<string, unknown>;
}) {
  const db = await getDb();
  const collection = db.collection("debug_logs");

  await collection.insertOne({
    ...data,
    createdAt: new Date(),
  });
}
