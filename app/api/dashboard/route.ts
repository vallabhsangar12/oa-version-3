import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Default empty state
    let userData = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      createdAt: null as Date | null,
    };
    let stats = {
      totalInterviews: 0,
      completedInterviews: 0,
      avgScore: 0,
      improvement: 0,
    };
    let performanceData: { name: string; score: number }[] = [];
    let skillsData: { name: string; value: number }[] = [];
    let recentInterviews: {
      id: string;
      date: Date;
      type: string;
      difficulty: string;
      status: string;
      score: number | null;
    }[] = [];

    try {
      const { query, queryOne } = await import("@/lib/postgres");

      const user = await queryOne<{ id: string; name: string; email: string; created_at: Date }>(
        "SELECT id, name, email, created_at FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (user) {
        userData = { id: user.id, name: user.name, email: user.email, createdAt: user.created_at };
      }

      const sessions = await query<{
        id: string;
        difficulty_level: string;
        interview_type: string;
        status: string;
        created_at: Date;
      }>(
        "SELECT id, difficulty_level, interview_type, status, created_at FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
        [decoded.userId]
      );

      const results = await query<{
        id: string;
        overall_score: number;
        communication_score: number;
        technical_score: number;
        confidence_score: number;
        created_at: Date;
        interview_session_id: string;
      }>(
        "SELECT id, overall_score, communication_score, technical_score, confidence_score, created_at, interview_session_id FROM interview_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
        [decoded.userId]
      );

      const totalInterviews = sessions.length;
      const completedInterviews = sessions.filter((s) => s.status === "completed").length;
      const avgScore =
        results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + (r.overall_score || 0), 0) / results.length)
          : 0;

      stats = {
        totalInterviews,
        completedInterviews,
        avgScore,
        improvement:
          results.length >= 2
            ? Math.round(
                ((results[0].overall_score - results[results.length - 1].overall_score) /
                  (results[results.length - 1].overall_score || 1)) *
                  100
              )
            : 0,
      };

      performanceData = results
        .slice(0, 6)
        .reverse()
        .map((r, i) => ({ name: `Session ${i + 1}`, score: r.overall_score || 0 }));

      const latestResult = results[0];
      skillsData = latestResult
        ? [
            { name: "Communication", value: latestResult.communication_score || 0 },
            { name: "Technical", value: latestResult.technical_score || 0 },
            { name: "Confidence", value: latestResult.confidence_score || 0 },
          ]
        : [];

      recentInterviews = sessions.slice(0, 5).map((s) => {
        const result = results.find((r) => r.interview_session_id === s.id);
        return {
          id: s.id,
          date: s.created_at,
          type: s.interview_type,
          difficulty: s.difficulty_level,
          status: s.status,
          score: result?.overall_score || null,
        };
      });
    } catch {
      console.warn("Dashboard: Database not available, returning empty data");
    }

    return NextResponse.json({
      user: userData,
      stats,
      performanceData,
      skillsData,
      recentInterviews,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
