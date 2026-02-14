import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rows = await query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'new')
       RETURNING id`,
      [name, email, phone || null, subject, message]
    );

    return NextResponse.json(
      { message: "Contact form submitted successfully", data: rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rows = await query(
      "SELECT * FROM contact_submissions ORDER BY created_at DESC"
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    console.error("Contact GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
