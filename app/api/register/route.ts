import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/postgres";

interface UserRow {
  id: string;
  name: string;
  email: string;
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

    // Check if user already exists
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
