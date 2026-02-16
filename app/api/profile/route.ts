import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query, queryOne } from "@/lib/postgres"

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret"

interface JwtPayload {
  userId: string
  email: string
  name: string
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await queryOne<{
      id: string
      name: string
      email: string
      created_at: Date
    }>(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [decoded.userId]
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get interview count
    const countResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) as count FROM interview_sessions WHERE user_id = $1",
      [decoded.userId]
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      stats: {
        totalInterviews: parseInt(countResult?.count || "0"),
      },
    })
  } catch (err) {
    console.error("Profile API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await query("UPDATE users SET name = $1 WHERE id = $2", [name.trim(), decoded.userId])

    return NextResponse.json({ message: "Profile updated" })
  } catch (err) {
    console.error("Profile update error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
