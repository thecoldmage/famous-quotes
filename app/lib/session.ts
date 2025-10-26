import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { UserPublic } from '@/types'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface Session {
  userId: string
  token: string
  expiresAt: Date
}

// In-memory session store (for development)
// In production, use Redis or database
const sessions = new Map<string, Session>()

export async function createSession(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const session: Session = {
    userId,
    token,
    expiresAt,
  }

  sessions.set(token, session)

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const session = sessions.get(token)

  if (!session) return null

  // Check if expired
  if (session.expiresAt < new Date()) {
    sessions.delete(token)
    return null
  }

  return session
}

export async function getCurrentUser(): Promise<UserPublic | null> {
  const session = await getSession()

  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      createdAt: true,
    },
  })

  return user
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    sessions.delete(token)
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<UserPublic> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireAdmin(): Promise<UserPublic> {
  const user = await requireAuth()

  if (!user.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

function generateToken(): string {
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
  )
}
