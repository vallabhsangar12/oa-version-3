import { NextResponse, NextRequest } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ message: "Logged out successfully" })

    const authCookie = clearAuthCookie()
    res.cookies.set(authCookie.token, "", authCookie.options)

    return res
  } catch (err) {
    console.error("[AUTH] Logout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
