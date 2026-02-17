import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signJWT, setAuthCookie } from "@/lib/auth"

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const { queryOne } = await import("@/lib/postgres")
    let user: UserRow | null = null

    try {
      user = await queryOne<UserRow>(
        "SELECT id, name, email, password_hash FROM users WHERE email = $1",
        [email.trim().toLowerCase()]
      )
    } catch (err) {
      console.error("[AUTH] Database error during login:", err)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

    const authCookie = setAuthCookie(token, process.env.NODE_ENV === "production")
    res.cookies.set(authCookie.token, token, authCookie.options)

    return res
  } catch (err) {
    console.error("[AUTH] Login error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
