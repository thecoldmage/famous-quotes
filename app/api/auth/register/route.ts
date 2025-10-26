import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { isUsernameValid } from '@/lib/profanity'
import { createSession } from '@/lib/session'
import { ApiResponse, AuthSession } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, username, password, captchaToken } = validation.data

    // Verify CAPTCHA
    // TODO: Implement hCaptcha verification when keys are available
    // For now, we'll skip this check in development
    if (process.env.HCAPTCHA_SECRET_KEY) {
      const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.HCAPTCHA_SECRET_KEY,
          response: captchaToken,
        }),
      })

      const captchaData = await captchaResponse.json()

      if (!captchaData.success) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'CAPTCHA verification failed',
          },
          { status: 400 }
        )
      }
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Username already taken',
        },
        { status: 400 }
      )
    }

    // Validate username for profanity
    const usernameValidation = await isUsernameValid(username)
    if (!usernameValidation.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: usernameValidation.error,
        },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    // Create session
    const token = await createSession(user.id)

    return NextResponse.json<ApiResponse<AuthSession>>(
      {
        success: true,
        data: {
          user,
          token,
        },
        message: 'Registration successful',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
