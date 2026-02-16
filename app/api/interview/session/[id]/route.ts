import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { getPreInterviewById } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getServerUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const session = await getPreInterviewById(id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify ownership
    if (session.userId !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error("Get session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
