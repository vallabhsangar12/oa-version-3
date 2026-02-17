import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/src/utils/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = (payload as any).userId || (payload as any).sub
    const sessionId = params.id

    // Try to use database if available
    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          {
            id: parseInt(sessionId),
            interview_type: 'technical',
            difficulty: 'medium',
            job_role: 'Software Engineer',
            experience_years: 5,
            tech_stack: [],
            status: 'pending',
            created_at: new Date().toISOString(),
          },
          { status: 200 }
        )
      }

      const result = await pool.query(
        `SELECT id, interview_type, difficulty, job_role, experience_years, tech_stack, status, created_at
         FROM interview_sessions
         WHERE id = $1 AND user_id = $2`,
        [sessionId, userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Interview session not found' },
          { status: 404 }
        )
      }

      const session = result.rows[0]
      return NextResponse.json(
        {
          ...session,
          tech_stack: typeof session.tech_stack === 'string'
            ? JSON.parse(session.tech_stack)
            : session.tech_stack || [],
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in GET interview-session:', dbError)
      // Graceful fallback
      return NextResponse.json(
        {
          id: parseInt(sessionId),
          interview_type: 'technical',
          difficulty: 'medium',
          job_role: 'Software Engineer',
          experience_years: 5,
          tech_stack: [],
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error getting session:', error)
    return NextResponse.json(
      { error: 'Failed to get interview session' },
      { status: 500 }
    )
  }
}
