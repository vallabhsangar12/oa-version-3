export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    POSTGRES_URL: process.env.POSTGRES_URL ? "SET" : "NOT SET",
    MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
    JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
    UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads (default)",
  });
}
