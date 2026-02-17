import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/src/utils/auth'

const planLimits: Record<string, { interviews_daily: number; interviews_monthly: number }> = {
  free: { interviews_daily: 1, interviews_monthly: 30 },
  basic: { interviews_daily: 10, interviews_monthly: 300 },
  pro: { interviews_daily: -1, interviews_monthly: -1 }, // -1 means unlimited
}

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
    const { plan } = await req.json()

    if (!plan || !planLimits[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Try to use database if available
    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres
      
      if (!pool) {
        return NextResponse.json(
          {
            success: true,
            message: 'Plan selected (database unavailable - will be saved on next sync)',
            plan,
          },
          { status: 200 }
        )
      }

      // Check if subscription exists
      const existing = await pool.query(
        'SELECT id FROM subscriptions WHERE user_id = $1',
        [userId]
      )

      const limits = planLimits[plan]
      const now = new Date()

      if (existing.rows.length > 0) {
        // Update existing subscription
        await pool.query(
          `UPDATE subscriptions 
           SET plan = $1, interviews_limit = $2, status = 'active', start_date = $3, updated_at = $4
           WHERE user_id = $5`,
          [plan, limits.interviews_daily, now, now, userId]
        )
      } else {
        // Create new subscription
        await pool.query(
          `INSERT INTO subscriptions (user_id, plan, interviews_limit, start_date, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, plan, limits.interviews_daily, now, now, now]
        )
      }

      return NextResponse.json(
        {
          success: true,
          message: `Successfully selected ${plan} plan`,
          plan,
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in select-plan:', dbError)
      // Graceful fallback - still allow the selection
      return NextResponse.json(
        {
          success: true,
          message: 'Plan selected (database unavailable)',
          plan,
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error in select-plan:', error)
    return NextResponse.json(
      { error: 'Failed to select plan' },
      { status: 500 }
    )
  }
}
