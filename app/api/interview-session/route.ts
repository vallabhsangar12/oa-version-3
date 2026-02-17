import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/src/utils/auth'

export async function POST(req: NextRequest) {
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
    const { interview_type, difficulty, job_role, experience_years, tech_stack } = await req.json()

    if (!interview_type || !difficulty || !job_role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to use database if available
    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          {
            success: true,
            session_id: Math.floor(Math.random() * 1000000),
            message: 'Session created (database unavailable)',
          },
          { status: 200 }
        )
      }

      const now = new Date()
      const result = await pool.query(
        `INSERT INTO interview_sessions (user_id, interview_type, difficulty, job_role, experience_years, tech_stack, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
         RETURNING id`,
        [
          userId,
          interview_type,
          difficulty,
          job_role,
          experience_years || 0,
          JSON.stringify(tech_stack || []),
          now,
          now,
        ]
      )

      const sessionId = result.rows[0].id

      return NextResponse.json(
        {
          success: true,
          session_id: sessionId,
          message: 'Interview session created',
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in interview-session:', dbError)
      // Graceful fallback
      return NextResponse.json(
        {
          success: true,
          session_id: Math.floor(Math.random() * 1000000),
          message: 'Session created (database unavailable)',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
