import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { ApiResponse, PaginatedResponse, QuoteWithRelations } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.favorite.count({
      where: { userId: user.id },
    })

    // Fetch favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        quote: {
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
            votes: {
              where: {
                userId: user.id,
              },
              select: {
                value: true,
              },
            },
          },
        },
      },
    })

    const formattedQuotes: QuoteWithRelations[] = favorites.map((fav: any) => ({
      id: fav.quote.id,
      text: fav.quote.text,
      date: fav.quote.date,
      origin: fav.quote.origin,
      originName: fav.quote.originName,
      upvotes: fav.quote.upvotes,
      downvotes: fav.quote.downvotes,
      createdAt: fav.quote.createdAt,
      person: {
        id: fav.quote.person.id,
        name: fav.quote.person.name,
        category: fav.quote.person.category,
        portraits: fav.quote.person.portraits,
      },
      tags: fav.quote.tags,
      userVote: fav.quote.votes?.[0]?.value || null,
      isFavorited: true,
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json<ApiResponse<PaginatedResponse<QuoteWithRelations>>>({
      success: true,
      data: {
        data: formattedQuotes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
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

    console.error('Get favorites error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
