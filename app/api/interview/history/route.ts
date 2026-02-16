import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import dbConnect, { getUserInterviewSetups, getInterviewSessions } from "@/lib/db";

export async function GET() {
  try {
    const payload = await getServerUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const [setups, sessions] = await Promise.all([
      getUserInterviewSetups(payload.userId),
      getInterviewSessions(payload.userId),
    ]);

    return NextResponse.json({ setups, sessions });
  } catch (err) {
    console.error("Interview history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
