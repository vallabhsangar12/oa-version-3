import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const SECRET = "INTERVIEW_SECRET"; // keep same everywhere

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔍 Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔐 Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 🔑 Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    // 🍪 Store token in cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    
  }
}
