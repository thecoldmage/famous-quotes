import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { quoteSchema } from '@/lib/validations'
import { ApiResponse } from '@/types'

// Update quote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = quoteSchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { text, personId, date, origin, originName, tags } = validation.data

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id },
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

    // Update quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(personId && { personId }),
        ...(date !== undefined && { date: date || null }),
        ...(origin !== undefined && { origin: origin || null }),
        ...(originName !== undefined && { originName: originName || null }),
      },
    })

    // Update tags if provided
    if (tags) {
      // Remove existing tag links
      await prisma.quoteTag.deleteMany({
        where: { quoteId: id },
      })

      // Create new tag links
      for (const tagSlug of tags) {
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1),
            slug: tagSlug,
          },
        })

        await prisma.quoteTag.create({
          data: {
            quoteId: id,
            tagId: tag.id,
          },
        })
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedQuote,
      message: 'Quote updated successfully',
    })
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

    console.error('Update quote error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Delete quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    // Check if quote exists
    const quote = await prisma.quote.findUnique({
      where: { id },
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

    // Delete quote (cascade will handle related records)
    await prisma.quote.delete({
      where: { id },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Quote deleted successfully',
    })
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

    console.error('Delete quote error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
