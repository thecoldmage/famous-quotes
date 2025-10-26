import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { createSession } from '@/lib/session'
import { ApiResponse, AuthSession } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Create session
    const token = await createSession(user.id)

    return NextResponse.json<ApiResponse<AuthSession>>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        token,
      },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
