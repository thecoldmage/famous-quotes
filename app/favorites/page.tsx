'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api-client'
import { QuoteWithRelations, PaginatedResponse } from '@/types'
import QuoteCard from '@/components/quotes/QuoteCard'
import Button from '@/components/ui/Button'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()
  const [quotes, setQuotes] = useState<QuoteWithRelations[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchFavorites(1, true)
    }
  }, [user])

  const fetchFavorites = async (pageNum: number, reset = false) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getFavorites({
        page: pageNum,
        limit: 20,
      })

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<QuoteWithRelations>

        if (reset) {
          setQuotes(paginatedData.data)
        } else {
          setQuotes((prev) => [...prev, ...paginatedData.data])
        }

        setHasMore(paginatedData.pagination.hasMore)
      } else {
        setError(response.error || 'Failed to load favorites')
      }
    } catch (err) {
      setError('An error occurred while loading favorites')
      console.error('Fetch favorites error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFavorites(nextPage)
  }

  const handleVote = async (quoteId: string, value: number) => {
    const response = await apiClient.voteQuote(quoteId, value)

    if (response.success) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? {
                ...q,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                userVote: response.data.userVote,
              }
            : q
        )
      )
    }
  }

  const handleUnfavorite = async (quoteId: string) => {
    const response = await apiClient.unfavoriteQuote(quoteId)

    if (response.success) {
      // Remove from list
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId))
    }
  }

  if (authLoading || (isLoading && quotes.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Favorites</h1>
          <p className="text-gray-600">
            {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} saved
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {quotes.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start exploring and save your favorite quotes!
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="primary"
            >
              Browse Quotes
            </Button>
          </div>
        ) : (
          <>
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                onVote={handleVote}
                onUnfavorite={handleUnfavorite}
              />
            ))}

            {hasMore && (
              <div className="text-center py-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            {!hasMore && quotes.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                You've seen all your favorites
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
