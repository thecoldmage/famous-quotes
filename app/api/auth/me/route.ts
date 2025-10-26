import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { ApiResponse, UserPublic } from '@/types'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse<UserPublic>>({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
