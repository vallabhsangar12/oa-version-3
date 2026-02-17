import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/src/utils/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { has_subscription: false, plan: 'none' },
        { status: 200 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { has_subscription: false, plan: 'none' },
        { status: 200 }
      )
    }

    const userId = (payload as any).userId || (payload as any).sub

    // Try to use database if available
    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          { has_subscription: true, plan: 'free', interviews_today: 0, interviews_limit: 1 },
          { status: 200 }
        )
      }

      const result = await pool.query(
        `SELECT plan, interviews_today, interviews_limit, status 
         FROM subscriptions 
         WHERE user_id = $1 AND status = 'active'`,
        [userId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { has_subscription: false, plan: 'none' },
          { status: 200 }
        )
      }

      const subscription = result.rows[0]
      return NextResponse.json(
        {
          has_subscription: true,
          plan: subscription.plan,
          interviews_today: subscription.interviews_today || 0,
          interviews_limit: subscription.interviews_limit || 1,
        },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in check subscription:', dbError)
      // Fallback to free plan if database unavailable
      return NextResponse.json(
        { has_subscription: true, plan: 'free', interviews_today: 0, interviews_limit: 1 },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('[v0] Error checking subscription:', error)
    return NextResponse.json(
      { has_subscription: false, plan: 'none' },
      { status: 200 }
    )
  }
}
