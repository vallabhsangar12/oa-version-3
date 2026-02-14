import { NextResponse } from "next/server";
import { getDb } from "@/utils/mongodb";

export async function POST() {
  try {
    const sessionId = crypto.randomUUID();

    const db = await getDb();

    await db.collection("interview_sessions").insertOne({
      sessionId,
      status: "ongoing",
      createdAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      sessionId,
    });
  } catch (error) {
    console.error("Interview start error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Interview session failed",
      },
      { status: 500 }
    );
  }
}
