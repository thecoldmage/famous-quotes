import { ApiResponse } from '@/types'

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        }
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      return {
        success: false,
        error: 'Network error',
      }
    }
  }

  // Auth endpoints
  async register(data: {
    email: string
    username: string
    password: string
    captchaToken: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/api/auth/me')
  }

  // Quote endpoints
  async getQuotes(params?: {
    page?: number
    limit?: number
    query?: string
    tags?: string[]
    sortBy?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.query) searchParams.set('query', params.query)
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)

    return this.request(`/api/quotes?${searchParams.toString()}`)
  }

  async getQuote(id: string) {
    return this.request(`/api/quotes/${id}`)
  }

  async voteQuote(quoteId: string, value: number) {
    return this.request(`/api/quotes/${quoteId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    })
  }

  async favoriteQuote(quoteId: string) {
    return this.request(`/api/quotes/${quoteId}/favorite`, {
      method: 'POST',
    })
  }

  async unfavoriteQuote(quoteId: string) {
    return this.request(`/api/quotes/${quoteId}/favorite`, {
      method: 'DELETE',
    })
  }

  async getFavorites(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return this.request(`/api/user/favorites?${searchParams.toString()}`)
  }

  // Tag endpoints
  async getTags() {
    return this.request('/api/tags')
  }

  // Admin endpoints
  async adminCreateQuote(data: any) {
    return this.request('/api/admin/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminUpdateQuote(id: string, data: any) {
    return this.request(`/api/admin/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async adminDeleteQuote(id: string) {
    return this.request(`/api/admin/quotes/${id}`, {
      method: 'DELETE',
    })
  }

  async adminCreatePerson(data: any) {
    return this.request('/api/admin/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminGetPersons(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    return this.request(`/api/admin/persons?${searchParams.toString()}`)
  }

  async adminUpdatePortrait(id: string, data: { imageUrl?: string; isPrimary?: boolean }) {
    return this.request(`/api/admin/portraits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
