import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "resumes");

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    // Validate file type - PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
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

    try {
      // Ensure uploads directory exists
      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      // Create filename with user ID and timestamp
      const timestamp = Date.now();
      const filename = `${decoded.userId}-${timestamp}.pdf`;
      const filepath = path.join(UPLOADS_DIR, filename);

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Save file
      await fs.writeFile(filepath, buffer);

      // Save resume URL to database
      try {
        const { queryOne } = await import("@/lib/postgres");
        await queryOne(
          "INSERT INTO resumes (user_id, file_url) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET file_url = $2",
          [decoded.userId, `/uploads/resumes/${filename}`]
        );
      } catch {
        // DB not available, but file is saved
      }

      return NextResponse.json(
        {
          message: "Resume uploaded successfully",
          url: `/uploads/resumes/${filename}`,
          filename: file.name,
          size: file.size,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("File save error:", err);
      return NextResponse.json(
        { error: "Failed to save resume file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
      // Delete from database
      const { queryOne } = await import("@/lib/postgres");
      const resume = await queryOne<{ file_url: string }>(
        "SELECT file_url FROM resumes WHERE user_id = $1",
        [decoded.userId]
      );

      if (resume?.file_url) {
        // Delete file from filesystem
        try {
          const filename = path.basename(resume.file_url);
          const filepath = path.join(UPLOADS_DIR, filename);
          await fs.unlink(filepath).catch(() => {
            // File might not exist, ignore
          });
        } catch {
          // Ignore file deletion errors
        }
      }

      // Delete from database
      await queryOne("DELETE FROM resumes WHERE user_id = $1", [decoded.userId]);

      return NextResponse.json({ message: "Resume deleted successfully" });
    } catch {
      // DB not available, still delete file if exists
      try {
        const files = await fs.readdir(UPLOADS_DIR);
        for (const file of files) {
          if (file.startsWith(`${decoded.userId}-`)) {
            await fs.unlink(path.join(UPLOADS_DIR, file)).catch(() => {
              // Ignore errors
            });
          }
        }
      } catch {
        // Directory might not exist
      }

      return NextResponse.json({ message: "Resume deleted" });
    }
  } catch (error) {
    console.error("Resume delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
