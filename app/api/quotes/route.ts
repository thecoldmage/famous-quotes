import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { ApiResponse, PaginatedResponse, QuoteWithRelations } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const query = searchParams.get('query') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular, random

    const skip = (page - 1) * limit

    // Get current user for vote/favorite status
    const currentUser = await getCurrentUser()

    // Build where clause
    const where: any = {}

    if (query) {
      where.text = {
        contains: query,
        mode: 'insensitive',
      }
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tags,
            },
          },
        },
      }
    }

    // Build order by clause
    let orderBy: any = {}
    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' }
        break
      case 'random':
        // PostgreSQL random ordering
        orderBy = undefined // We'll handle this differently
        break
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Get total count
    const total = await prisma.quote.count({ where })

    // Fetch quotes
    let quotes = await prisma.quote.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy === 'random' ? undefined : orderBy,
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

    // If random, shuffle the results
    if (sortBy === 'random') {
      quotes = quotes.sort(() => Math.random() - 0.5)
    }

    // Format response
    const formattedQuotes: QuoteWithRelations[] = quotes.map((quote: any) => ({
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
      userVote: quote.votes?.[0]?.value || null,
      isFavorited: quote.favorites?.length > 0,
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
    console.error('Get quotes error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
