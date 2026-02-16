import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export async function GET() {
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

    let totalInterviews = 0;

    try {
      const { queryOne } = await import("@/lib/postgres");
      const user = await queryOne<{ id: string; name: string; email: string; created_at: Date }>(
        "SELECT id, name, email, created_at FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (user) {
        const countResult = await queryOne<{ count: string }>(
          "SELECT COUNT(*) as count FROM interview_sessions WHERE user_id = $1",
          [decoded.userId]
        );
        totalInterviews = parseInt(countResult?.count || "0");

        return NextResponse.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.created_at,
          },
          stats: { totalInterviews },
        });
      }
    } catch {
      // DB not available
    }

    return NextResponse.json({
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        createdAt: null,
      },
      stats: { totalInterviews },
    });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    try {
      const { query } = await import("@/lib/postgres");
      await query("UPDATE users SET name = $1 WHERE id = $2", [name.trim(), decoded.userId]);
    } catch {
      // DB not available - still update JWT
    }

    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, name: name.trim() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ message: "Profile updated", user: { name: name.trim() } });
    res.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
