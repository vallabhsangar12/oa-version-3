import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/src/utils/auth'
import bcrypt from 'bcryptjs'

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
    const { currentPassword, newPassword, confirmPassword } = await req.json()

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    try {
      const postgres = await import('@/lib/postgres')
      const { pool } = postgres

      if (!pool) {
        return NextResponse.json(
          { error: 'Database unavailable' },
          { status: 503 }
        )
      }

      // Get current user
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const user = userResult.rows[0]

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      )

      return NextResponse.json(
        { success: true, message: 'Password changed successfully' },
        { status: 200 }
      )
    } catch (dbError) {
      console.error('[v0] Database error in change-password:', dbError)
      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Error changing password:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
