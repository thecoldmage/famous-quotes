import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { voteSchema } from '@/lib/validations'
import { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: quoteId } = await params
    const body = await request.json()

    // Validate input
    const validation = voteSchema.safeParse({ quoteId, ...body })
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { value } = validation.data

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

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_quoteId: {
          userId: user.id,
          quoteId,
        },
      },
    })

    let updatedUpvotes = quote.upvotes
    let updatedDownvotes = quote.downvotes

    if (existingVote) {
      // Remove old vote count
      if (existingVote.value === 1) {
        updatedUpvotes--
      } else if (existingVote.value === -1) {
        updatedDownvotes--
      }

      if (value === 0) {
        // Remove vote
        await prisma.vote.delete({
          where: {
            userId_quoteId: {
              userId: user.id,
              quoteId,
            },
          },
        })
      } else {
        // Update vote
        await prisma.vote.update({
          where: {
            userId_quoteId: {
              userId: user.id,
              quoteId,
            },
          },
          data: { value },
        })

        // Add new vote count
        if (value === 1) {
          updatedUpvotes++
        } else if (value === -1) {
          updatedDownvotes++
        }
      }
    } else {
      // Create new vote
      if (value !== 0) {
        await prisma.vote.create({
          data: {
            userId: user.id,
            quoteId,
            value,
          },
        })

        // Add vote count
        if (value === 1) {
          updatedUpvotes++
        } else if (value === -1) {
          updatedDownvotes++
        }
      }
    }

    // Update quote counts
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        upvotes: updatedUpvotes,
        downvotes: updatedDownvotes,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Vote recorded',
      data: {
        upvotes: updatedUpvotes,
        downvotes: updatedDownvotes,
        userVote: value,
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

    console.error('Vote error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
