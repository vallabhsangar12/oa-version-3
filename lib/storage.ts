import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

interface SaveFileResult {
  filePath: string;
  originalName: string;
}

export async function saveResumeFile(
  userId: string,
  file: File
): Promise<SaveFileResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Only PDF files are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 5MB limit");
  }

  const resumeDir = path.join(UPLOAD_DIR, "resumes");
  await mkdir(resumeDir, { recursive: true });

  const ext = path.extname(file.name) || ".pdf";
  const filename = `${userId}_${uuidv4()}${ext}`;
  const filePath = path.join(resumeDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const relativePath = path.join("resumes", filename);

  return {
    filePath: relativePath,
    originalName: file.name,
  };
}

export function getUploadUrl(relativePath: string): string {
  if (process.env.NODE_ENV === "production" && process.env.S3_BASE_URL) {
    return `${process.env.S3_BASE_URL}/${relativePath}`;
  }
  return `/api/uploads/${relativePath}`;
}

export function getAbsolutePath(relativePath: string): string {
  return path.join(UPLOAD_DIR, relativePath);
}
