import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            quotes: true,
          },
        },
      },
    })

    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      quoteCount: tag._count.quotes,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formattedTags,
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
