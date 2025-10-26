'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { QuoteWithRelations, PaginatedResponse } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useAuthStore, useFilterStore } from '@/lib/store'
import QuoteCard from './QuoteCard'

export default function QuoteFeed() {
  const [quotes, setQuotes] = useState<QuoteWithRelations[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()
  const { selectedTags, searchQuery, sortBy } = useFilterStore()

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '500px',
  })

  const fetchQuotes = useCallback(
    async (pageNum: number, reset = false) => {
      if (isLoading || (!hasMore && !reset)) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.getQuotes({
          page: pageNum,
          limit: 10,
          query: searchQuery || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          sortBy,
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
          setError(response.error || 'Failed to load quotes')
        }
      } catch (err) {
        setError('An error occurred while loading quotes')
        console.error('Fetch quotes error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, hasMore, searchQuery, selectedTags, sortBy]
  )

  // Initial load and filter changes
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchQuotes(1, true)
  }, [searchQuery, selectedTags, sortBy])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchQuotes(nextPage)
    }
  }, [inView, hasMore, isLoading, page])

  const handleVote = async (quoteId: string, value: number) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    const response = await apiClient.voteQuote(quoteId, value)

    if (response.success) {
      // Update local state
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

  const handleFavorite = async (quoteId: string) => {
    if (!user) {
      alert('Please login to favorite')
      return
    }

    const response = await apiClient.favoriteQuote(quoteId)

    if (response.success) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? { ...q, isFavorited: true } : q
        )
      )
    }
  }

  const handleUnfavorite = async (quoteId: string) => {
    if (!user) return

    const response = await apiClient.unfavoriteQuote(quoteId)

    if (response.success) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? { ...q, isFavorited: false } : q
        )
      )
    }
  }

  if (error && quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchQuotes(1, true)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {quotes.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No quotes found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onVote={handleVote}
              onFavorite={handleFavorite}
              onUnfavorite={handleUnfavorite}
            />
          ))}

          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isLoading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}
            </div>
          )}

          {!hasMore && quotes.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              You've reached the end
            </div>
          )}
        </>
      )}
    </div>
  )
}
