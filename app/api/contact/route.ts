import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: Date;
}

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

    await query(
      `INSERT INTO contact_submissions (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, phone || null, subject, message]
    );

    return NextResponse.json(
      { message: "Contact form submitted successfully" },
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
    const data = await query<ContactRow>(
      "SELECT * FROM contact_submissions ORDER BY created_at DESC"
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Contact GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
