import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { ApiResponse, QuoteWithRelations } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            category: true,
            portraits: {
              where: {
                OR: [{ isPrimary: true }, { imageUrl: { not: '' } }],
              },
              take: 1,
              orderBy: { isPrimary: 'desc' },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        votes: currentUser
          ? {
              where: {
                userId: currentUser.id,
              },
              select: {
                value: true,
              },
            }
          : false,
        favorites: currentUser
          ? {
              where: {
                userId: currentUser.id,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
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

    const formattedQuote: QuoteWithRelations = {
      id: quote.id,
      text: quote.text,
      date: quote.date,
      origin: quote.origin,
      originName: quote.originName,
      upvotes: quote.upvotes,
      downvotes: quote.downvotes,
      createdAt: quote.createdAt,
      person: {
        id: quote.person.id,
        name: quote.person.name,
        category: quote.person.category,
        portraits: quote.person.portraits,
      },
      tags: quote.tags,
      userVote: (quote.votes as any)?.[0]?.value || null,
      isFavorited: (quote.favorites as any)?.length > 0,
    }

    return NextResponse.json<ApiResponse<QuoteWithRelations>>({
      success: true,
      data: formattedQuote,
    })
  } catch (error) {
    console.error('Get quote error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
