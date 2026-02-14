import { type NextRequest, NextResponse } from "next/server";
import { saveResumeFile, getUploadUrl } from "@/lib/storage";
import { query } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and User ID required" },
        { status: 400 }
      );
    }

    // saveResumeFile validates type (PDF) and size (5MB)
    const { filePath, originalName } = await saveResumeFile(userId, file);

    // Store metadata in PostgreSQL
    await query(
      `INSERT INTO resumes (user_id, file_path, original_name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, filePath, originalName]
    );

    const resumeUrl = getUploadUrl(filePath);

    return NextResponse.json(
      {
        message: "Resume uploaded successfully",
        resumeUrl,
        filename: originalName,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("PDF") ||
        error.message.includes("5MB")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
