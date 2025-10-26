import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { personSchema } from '@/lib/validations'
import { generatePortraitPrompt } from '@/lib/portrait-prompt'
import { ApiResponse } from '@/types'

// Get all persons (with pagination)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              quotes: true,
            },
          },
          portraits: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),
      prisma.person.count(),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: persons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
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

    console.error('Get persons error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Create new person
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Validate input
    const validation = personSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { name, description, biography, isRealPerson, category } = validation.data

    // Create person
    const person = await prisma.person.create({
      data: {
        name,
        description,
        biography,
        isRealPerson,
        category: category || null,
      },
    })

    // Generate portrait prompt
    const prompt = generatePortraitPrompt({
      name: person.name,
      description: person.description,
      biography: person.biography,
      isRealPerson: person.isRealPerson,
      category: person.category,
    })

    // Create portrait entry
    await prisma.portrait.create({
      data: {
        personId: person.id,
        imageUrl: '', // To be filled manually after generation
        prompt,
        isPrimary: true,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: person,
        message: 'Person created successfully',
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

    console.error('Create person error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
