import { type NextRequest, NextResponse } from "next/server";
import { saveFile } from "@/lib/file-storage";
import { query } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and User ID required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and Word documents are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Save file to local storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = await saveFile(buffer, "resumes", file.name);

    // Store metadata in PostgreSQL
    await query(
      "INSERT INTO resumes (user_id, file_path, original_name) VALUES ($1, $2, $3)",
      [userId, filePath, file.name]
    );

    return NextResponse.json(
      {
        message: "Resume uploaded successfully",
        resumeUrl: filePath,
        filename: file.name,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
