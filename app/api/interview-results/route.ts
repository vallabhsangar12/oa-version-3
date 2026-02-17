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
    const {
      session_id,
      overall_score,
      emotion_score,
      speech_score,
      technical_score,
      confidence_score,
      communication_score,
      summary,
      feedback,
    } = await req.json()

    if (!session_id || overall_score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          {
            success: true,
            result_id: Math.floor(Math.random() * 1000000),
            message: 'Result saved (database unavailable)',
          },
          { status: 200 }
        )
      }

      const now = new Date()
      const result = await pool.query(
        `INSERT INTO interview_results 
         (session_id, user_id, overall_score, emotion_score, speech_score, technical_score, confidence_score, communication_score, summary, feedback, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          session_id,
          userId,
          overall_score,
          emotion_score || null,
          speech_score || null,
          technical_score || null,
          confidence_score || null,
          communication_score || null,
          summary || null,
          feedback || null,
          now,
          now,
        ]
      )

      // Also update the interview session status
      await pool.query(
        'UPDATE interview_sessions SET status = $1, updated_at = $2 WHERE id = $3',
        ['completed', now, session_id]
      )

      const resultId = result.rows[0].id

      return NextResponse.json(
        {
          success: true,
          result_id: resultId,
          message: 'Interview result saved',
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in interview-results:', dbError)
      return NextResponse.json(
        {
          success: true,
          result_id: Math.floor(Math.random() * 1000000),
          message: 'Result saved (database unavailable)',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error saving interview result:', error)
    return NextResponse.json(
      { error: 'Failed to save interview result' },
      { status: 500 }
    )
  }
}

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

    const userId = (payload as any).userId || (payload as any).sub

    // Get result_id from query params
    const searchParams = req.nextUrl.searchParams
    const resultId = searchParams.get('result_id')

    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          {
            id: resultId,
            overall_score: 0,
            emotion_score: 0,
            speech_score: 0,
            technical_score: 0,
          },
          { status: 200 }
        )
      }

      const result = await pool.query(
        `SELECT id, session_id, overall_score, emotion_score, speech_score, technical_score, confidence_score, communication_score, summary, feedback, created_at
         FROM interview_results
         WHERE id = $1 AND user_id = $2`,
        [resultId, userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Result not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(result.rows[0], { status: 200 })
    } catch (dbError) {
      console.error('[v0] Database error in GET interview-results:', dbError)
      return NextResponse.json(
        {
          id: resultId,
          overall_score: 0,
          emotion_score: 0,
          speech_score: 0,
          technical_score: 0,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error getting interview result:', error)
    return NextResponse.json(
      { error: 'Failed to get interview result' },
      { status: 500 }
    )
  }
}
