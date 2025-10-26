import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: quoteId } = await params

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    })

    if (!quote) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Quote not found',
        },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_quoteId: {
          userId: user.id,
          quoteId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Quote already favorited',
        },
        { status: 400 }
      )
    }

    // Create favorite
    await prisma.favorite.create({
      data: {
        userId: user.id,
        quoteId,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Quote favorited',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    console.error('Favorite error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: quoteId } = await params

    // Delete favorite
    const result = await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        quoteId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Favorite not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Quote unfavorited',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    console.error('Unfavorite error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
