import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
      const { query, queryOne } = await import("@/lib/postgres");

      const tokenRow = await queryOne<{ id: string; user_id: string; token: string; expires_at: Date }>(
        "SELECT id, user_id, token, expires_at FROM password_reset_tokens WHERE token = $1",
        [token]
      );

      if (!tokenRow) {
        return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
      }

      if (new Date(tokenRow.expires_at) < new Date()) {
        await query("DELETE FROM password_reset_tokens WHERE id = $1", [tokenRow.id]);
        return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashedPassword, tokenRow.user_id]);
      await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [tokenRow.user_id]);

      return NextResponse.json({
        message: "Password reset successful. You can now log in with your new password.",
      });
    } catch {
      return NextResponse.json(
        { error: "Database is not available. Please try again later." },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
