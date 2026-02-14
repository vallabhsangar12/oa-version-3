import mongoose from "mongoose";

// ----------------------
// Mongo connection
// ----------------------
const MONGO_URI = "mongodb://127.0.0.1:27017/ai_interview_db";

export default async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}

// ----------------------
// Schemas
// ----------------------
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
  },
  { timestamps: true }
);

const ContactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    phone: String,
  },
  { timestamps: true }
);

const PreInterviewSchema = new mongoose.Schema(
  {
    userId: String,
    difficultyLevel: String,
    interviewType: String,
    resumeUrl: String,
    resumeFilename: String,
    resumeContent: String,
  },
  { timestamps: true }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    userId: String,
    preInterviewSetupId: String,
    title: String,
    durationSeconds: Number,
    score: Number,
    transcript: String,
    emotionAnalysis: Object,
    feedback: String,
  },
  { timestamps: true }
);

const PerformanceSchema = new mongoose.Schema(
  {
    sessionId: String,
    communicationScore: Number,
    technicalScore: Number,
    confidenceScore: Number,
    overallScore: Number,
    strengths: String,
    improvements: String,
    recommendations: String,
  },
  { timestamps: true }
);

// ----------------------
// Models
// ----------------------
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
const PreInterview =
  mongoose.models.PreInterview ||
  mongoose.model("PreInterview", PreInterviewSchema);
const InterviewSession =
  mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", InterviewSessionSchema);
const Performance =
  mongoose.models.Performance ||
  mongoose.model("Performance", PerformanceSchema);

// ----------------------
// User operations
// ----------------------
export async function createUser(
  name: string,
  email: string,
  passwordHash: string
) {
  await dbConnect();
  return User.create({ name, email, password: passwordHash });
}

export async function getUserByEmail(email: string) {
  await dbConnect();
  return User.findOne({ email });
}

export async function getUserById(userId: string) {
  await dbConnect();
  return User.findById(userId);
}

export async function updateUser(userId: string, updates: Record<string, any>) {
  await dbConnect();
  return User.findByIdAndUpdate(userId, updates, { new: true });
}

// ----------------------
// Contact operations
// ----------------------
export async function createContactSubmission(
  name: string,
  email: string,
  subject: string,
  message: string,
  phone?: string
) {
  await dbConnect();
  return Contact.create({ name, email, subject, message, phone });
}

export async function getContactSubmissions() {
  await dbConnect();
  return Contact.find().sort({ createdAt: -1 });
}

// ----------------------
// Pre-interview setup
// ----------------------
export async function createPreInterviewSetup(
  userId: string,
  difficultyLevel: string,
  interviewType: string,
  resumeUrl?: string,
  resumeFilename?: string,
  resumeContent?: string
) {
  await dbConnect();
  return PreInterview.create({
    userId,
    difficultyLevel,
    interviewType,
    resumeUrl,
    resumeFilename,
    resumeContent,
  });
}

export async function getLatestPreInterviewSetup(userId: string) {
  await dbConnect();
  return PreInterview.findOne({ userId }).sort({ createdAt: -1 });
}

// ----------------------
// Interview sessions
// ----------------------
export async function createInterviewSession(
  userId: string,
  preInterviewSetupId: string,
  title: string,
  durationSeconds: number,
  score: number,
  transcript?: string,
  emotionAnalysis?: Record<string, any>,
  feedback?: string
) {
  await dbConnect();
  return InterviewSession.create({
    userId,
    preInterviewSetupId,
    title,
    durationSeconds,
    score,
    transcript,
    emotionAnalysis,
    feedback,
  });
}

export async function getInterviewSessions(userId: string) {
  await dbConnect();
  return InterviewSession.find({ userId });
}

export async function getInterviewSessionById(sessionId: string) {
  await dbConnect();
  return InterviewSession.findById(sessionId);
}

// ----------------------
// Performance reports
// ----------------------
export async function createPerformanceReport(
  sessionId: string,
  communicationScore: number,
  technicalScore: number,
  confidenceScore: number,
  overallScore: number,
  strengths?: string,
  improvements?: string,
  recommendations?: string
) {
  await dbConnect();
  return Performance.create({
    sessionId,
    communicationScore,
    technicalScore,
    confidenceScore,
    overallScore,
    strengths,
    improvements,
    recommendations,
  });
}

export async function getPerformanceReport(sessionId: string) {
  await dbConnect();
  return Performance.findOne({ sessionId });
}

export async function getPerformanceReportsByUserId(userId: string) {
  await dbConnect();
  const sessions = await InterviewSession.find({ userId }).select("_id");
  const ids = sessions.map((s) => s._id);
  return Performance.find({ sessionId: { $in: ids } });
}