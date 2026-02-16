import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

/**
 * Save a file to local storage.
 * In production, replace this with S3 upload logic.
 */
export async function saveFile(
  buffer: Buffer,
  subDir: string,
  filename: string
): Promise<string> {
  const dir = path.join(process.cwd(), UPLOAD_DIR, subDir);
  await mkdir(dir, { recursive: true });

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const finalName = `${timestamp}_${safeFilename}`;
  const filePath = path.join(dir, finalName);

  await writeFile(filePath, buffer);

  // Return relative URL path
  return `/uploads/${subDir}/${finalName}`;
}

/**
 * Get the absolute filesystem path for an upload URL.
 */
export function getAbsolutePath(relativeUrl: string): string {
  return path.join(process.cwd(), relativeUrl);
}
