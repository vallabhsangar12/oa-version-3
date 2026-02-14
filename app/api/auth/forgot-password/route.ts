import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { queryOne, query } from "@/lib/postgres";

interface UserRow {
  id: string;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await queryOne<UserRow>(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Delete any existing tokens for this user
    await query(
      "DELETE FROM password_reset_tokens WHERE user_id = $1",
      [user.id]
    );

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt.toISOString()]
    );

    // In development, log the reset link
    if (process.env.NODE_ENV !== "production") {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password/${token}`;
      console.log("--------------------------------------------------");
      console.log("PASSWORD RESET LINK (dev only):");
      console.log(resetUrl);
      console.log("--------------------------------------------------");
    }

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
