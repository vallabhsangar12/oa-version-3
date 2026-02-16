import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { queryOne } from "@/lib/postgres";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await queryOne<UserRow>(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Auth/me error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
