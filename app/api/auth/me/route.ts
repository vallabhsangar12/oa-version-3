import { NextResponse, NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      const { queryOne } = await import("@/lib/postgres")
      const dbUser = await queryOne<{
        id: string
        name: string
        email: string
        created_at: Date
      }>("SELECT id, name, email, created_at FROM users WHERE id = $1", [
        user.userId,
      ])

      if (dbUser) {
        return NextResponse.json({
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            createdAt: dbUser.created_at,
          },
        })
      }
    } catch (err) {
      console.error("[AUTH] Database error in /me:", err)
      // Fallback to JWT data if DB unavailable
    }

    return NextResponse.json({
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        createdAt: null,
      },
    })
  } catch (err) {
    console.error("[AUTH] /me error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
