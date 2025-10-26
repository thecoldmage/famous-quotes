import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { quoteSchema } from '@/lib/validations'
import { ApiResponse } from '@/types'

// Create new quote
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = quoteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { text, personId, date, origin, originName, tags } = validation.data

    // Check if person exists
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Person not found',
        },
        { status: 404 }
      )
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        text,
        personId,
        date: date || null,
        origin: origin || null,
        originName: originName || null,
      },
    })

    // Link tags
    for (const tagSlug of tags) {
      // Get or create tag
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          name: tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1),
          slug: tagSlug,
        },
      })

      // Link quote to tag
      await prisma.quoteTag.create({
        data: {
          quoteId: quote.id,
          tagId: tag.id,
        },
      })
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: quote,
        message: 'Quote created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    console.error('Create quote error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
