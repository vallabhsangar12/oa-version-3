import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/postgres";

interface TokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find the token
    const tokenRow = await queryOne<TokenRow>(
      "SELECT id, user_id, token, expires_at FROM password_reset_tokens WHERE token = $1",
      [token]
    );

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date(tokenRow.expires_at) < new Date()) {
      // Clean up expired token
      await query("DELETE FROM password_reset_tokens WHERE id = $1", [tokenRow.id]);
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hashedPassword, tokenRow.user_id]
    );

    // Delete the used token
    await query(
      "DELETE FROM password_reset_tokens WHERE user_id = $1",
      [tokenRow.user_id]
    );

    return NextResponse.json({
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
