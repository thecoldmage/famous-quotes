// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User types
export interface UserPublic {
  id: string
  email: string
  username: string
  isAdmin: boolean
  createdAt: Date
}

export interface AuthSession {
  user: UserPublic
  token: string
}

// Quote types
export interface QuoteWithRelations {
  id: string
  text: string
  date?: string | null
  origin?: string | null
  originName?: string | null
  upvotes: number
  downvotes: number
  createdAt: Date
  person: {
    id: string
    name: string
    category?: string | null
    portraits: {
      id: string
      imageUrl: string
      isPrimary: boolean
    }[]
  }
  tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  userVote?: number | null // User's vote on this quote (-1, 0, 1)
  isFavorited?: boolean // Whether user has favorited this quote
}

// Person types
export interface PersonWithQuotes {
  id: string
  name: string
  description: string
  biography: string
  isRealPerson: boolean
  category?: string | null
  quotes: {
    id: string
    text: string
    date?: string | null
    origin?: string | null
    originName?: string | null
  }[]
  portraits: {
    id: string
    imageUrl: string
    prompt: string
    isPrimary: boolean
  }[]
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}
