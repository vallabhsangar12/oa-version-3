import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production'

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

export interface AuthPayload {
  userId: string
  email: string
  name: string
  iat?: number
  exp?: number
}

/**
 * Verify JWT token and return payload
 */
export function verifyJWT(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    return decoded
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error)
    return null
  }
}

/**
 * Sign JWT token
 */
export function signJWT(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Extract user from Next.js Request
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthPayload | null> {
  const { cookies } = req
  const token = cookies.get('token')?.value

  if (!token) {
    return null
  }

  return verifyJWT(token)
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(req: NextRequest) {
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return user
}

/**
 * Set auth cookie
 */
export function setAuthCookie(token: string, isProduction: boolean) {
  const cookie = {
    token: token,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    },
  }
  return cookie
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie() {
  return {
    token: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  }
}
