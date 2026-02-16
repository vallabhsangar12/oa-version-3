import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      const { query, queryOne } = await import("@/lib/postgres");

      const user = await queryOne<{ id: string; email: string }>(
        "SELECT id, email FROM users WHERE email = $1",
        [email.trim().toLowerCase()]
      );

      // Always return success to prevent email enumeration
      if (!user) {
        return NextResponse.json({
          message: "If an account exists with that email, a reset link has been generated.",
        });
      }

      // Delete any existing tokens for this user
      await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id]);

      // Create new token - expires in 1 hour
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await query(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );

      const resetUrl = `/reset-password/${token}`;
      console.log(`Password reset link: ${resetUrl}`);

      return NextResponse.json({
        message: "If an account exists with that email, a reset link has been generated.",
        ...(process.env.NODE_ENV !== "production" && { resetToken: token, resetUrl }),
      });
    } catch {
      return NextResponse.json(
        { error: "Database is not available. Please try again later." },
        { status: 503 }
      );
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
