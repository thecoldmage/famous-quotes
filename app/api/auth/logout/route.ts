import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'
import { ApiResponse } from '@/types'

export async function POST() {
  try {
    await deleteSession()

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
