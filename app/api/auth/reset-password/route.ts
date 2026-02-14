import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne, query } from "@/lib/postgres";

interface TokenRow {
  id: string;
  user_id: string;
  expires_at: Date;
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const resetToken = await queryOne<TokenRow>(
      "SELECT id, user_id, expires_at FROM password_reset_tokens WHERE token = $1",
      [token]
    );

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      // Clean up expired token
      await query("DELETE FROM password_reset_tokens WHERE id = $1", [
        resetToken.id,
      ]);
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      resetToken.user_id,
    ]);

    // Delete the used token
    await query("DELETE FROM password_reset_tokens WHERE id = $1", [
      resetToken.id,
    ]);

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
