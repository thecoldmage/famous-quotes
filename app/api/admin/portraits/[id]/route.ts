import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { ApiResponse } from '@/types'

// Update portrait (mainly for adding imageUrl after generation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const { imageUrl, isPrimary } = body

    if (!imageUrl && isPrimary === undefined) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'imageUrl or isPrimary is required',
        },
        { status: 400 }
      )
    }

    // Check if portrait exists
    const portrait = await prisma.portrait.findUnique({
      where: { id },
    })

    if (!portrait) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Portrait not found',
        },
        { status: 404 }
      )
    }

    // If setting as primary, unset other primary portraits for this person
    if (isPrimary === true) {
      await prisma.portrait.updateMany({
        where: {
          personId: portrait.personId,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      })
    }

    // Update portrait
    const updatedPortrait = await prisma.portrait.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedPortrait,
      message: 'Portrait updated successfully',
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

    console.error('Update portrait error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
