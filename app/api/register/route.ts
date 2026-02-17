import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signJWT, setAuthCookie } from "@/lib/auth"

interface UserRow {
  id: string;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    try {
      const { query, queryOne } = await import("@/lib/postgres");

      const existing = await queryOne<UserRow>(
        "SELECT id FROM users WHERE email = $1",
        [email.trim().toLowerCase()]
      );

      if (existing) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await queryOne<UserRow>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [name.trim(), email.trim().toLowerCase(), hashedPassword]
      )

      if (!result) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        )
      }

      // Auto-login user after registration
      const token = signJWT({
        userId: result.id,
        email: email.trim().toLowerCase(),
        name: name.trim(),
      })

      const res = NextResponse.json(
        { message: "Registration successful" },
        { status: 201 }
      )

      const authCookie = setAuthCookie(token, process.env.NODE_ENV === "production")
      res.cookies.set(authCookie.token, token, authCookie.options)

      return res
    } catch (err) {
      console.error("[AUTH] Database error during registration:", err)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }
  } catch (err) {
    console.error("[AUTH] Register error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
