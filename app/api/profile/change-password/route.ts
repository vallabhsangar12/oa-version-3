import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface UserRow {
  id: string;
  password_hash: string;
}

export async function POST(req: Request) {
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

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new passwords are required" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    try {
      const { queryOne, query } = await import("@/lib/postgres");

      const user = await queryOne<UserRow>(
        "SELECT id, password_hash FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [hashedPassword, decoded.userId]
      );

      return NextResponse.json({ message: "Password changed successfully" });
    } catch {
      return NextResponse.json(
        { error: "Database is not available. Please try again later." },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("Change password API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
