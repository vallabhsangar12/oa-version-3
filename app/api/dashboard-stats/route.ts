import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId

    // Try to use database if available
    try {
      const { getPool } = await import('@/lib/postgres')
      const pool = getPool()

      if (!pool) {
        // Return default empty data
        return NextResponse.json(
          {
            total_interviews: 0,
            avg_score: 0,
            best_score: 0,
            last_interview_score: null,
            interviews: [],
          },
          { status: 200 }
        )
      }

      // Get total interviews
      const totalRes = await pool.query(
        'SELECT COUNT(*) as count FROM interview_sessions WHERE user_id = $1',
        [userId]
      )
      const totalInterviews = parseInt(totalRes.rows[0].count) || 0

      // Get average score
      const avgRes = await pool.query(
        'SELECT AVG(overall_score) as avg FROM interview_results WHERE user_id = $1',
        [userId]
      )
      const avgScore = Math.round((parseFloat(avgRes.rows[0].avg) || 0) * 100) / 100

      // Get best score
      const bestRes = await pool.query(
        'SELECT MAX(overall_score) as max FROM interview_results WHERE user_id = $1',
        [userId]
      )
      const bestScore = Math.round((parseFloat(bestRes.rows[0].max) || 0) * 100) / 100

      // Get last interview score
      const lastRes = await pool.query(
        `SELECT ir.overall_score, ir.created_at, ises.job_role
         FROM interview_results ir
         JOIN interview_sessions ises ON ir.session_id = ises.id
         WHERE ir.user_id = $1
         ORDER BY ir.created_at DESC
         LIMIT 1`,
        [userId]
      )
      const lastInterview = lastRes.rows[0] || null

      // Get interview history (last 10)
      const historyRes = await pool.query(
        `SELECT ises.id, ises.job_role, ises.interview_type, ises.difficulty, ises.created_at,
                EXTRACT(EPOCH FROM (ir.created_at - ises.created_at))::INTEGER as duration_seconds,
                ir.overall_score as score, ises.status
         FROM interview_sessions ises
         LEFT JOIN interview_results ir ON ises.id = ir.session_id
         WHERE ises.user_id = $1
         ORDER BY ises.created_at DESC
         LIMIT 10`,
        [userId]
      )
      const interviews = historyRes.rows.map((row) => ({
        id: row.id,
        job_role: row.job_role,
        interview_type: row.interview_type,
        difficulty: row.difficulty,
        created_at: row.created_at,
        duration_seconds: row.duration_seconds || 0,
        score: row.score,
        status: row.status,
      }))

      return NextResponse.json(
        {
          total_interviews: totalInterviews,
          avg_score: avgScore,
          best_score: bestScore,
          last_interview_score: lastInterview?.overall_score || null,
          last_interview_role: lastInterview?.job_role || null,
          interviews,
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in dashboard:', dbError)
      // Graceful fallback
      return NextResponse.json(
        {
          total_interviews: 0,
          avg_score: 0,
          best_score: 0,
          last_interview_score: null,
          interviews: [],
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error getting dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    )
  }
}
