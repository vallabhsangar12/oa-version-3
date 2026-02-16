import { type NextRequest, NextResponse } from "next/server";

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

    try {
      const { query } = await import("@/lib/postgres");
      await query(
        `INSERT INTO contact_submissions (name, email, phone, subject, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [name, email, phone || null, subject, message]
      );
    } catch {
      // DB not available - log the submission
      console.log("Contact submission (DB unavailable):", { name, email, phone, subject, message });
    }

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
