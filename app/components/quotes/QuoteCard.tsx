'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { QuoteWithRelations } from '@/types'
import Card from '../ui/Card'
import Tag from '../ui/Tag'
import { useState } from 'react'

interface QuoteCardProps {
  quote: QuoteWithRelations
  onVote?: (quoteId: string, value: number) => void
  onFavorite?: (quoteId: string) => void
  onUnfavorite?: (quoteId: string) => void
  onTagClick?: (tagSlug: string) => void
}

export default function QuoteCard({
  quote,
  onVote,
  onFavorite,
  onUnfavorite,
  onTagClick,
}: QuoteCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)

  const handleVote = async (value: number) => {
    if (isVoting || !onVote) return
    setIsVoting(true)
    await onVote(quote.id, value)
    setIsVoting(false)
  }

  const handleFavorite = async () => {
    if (isFavoriting) return
    setIsFavoriting(true)

    if (quote.isFavorited && onUnfavorite) {
      await onUnfavorite(quote.id)
    } else if (!quote.isFavorited && onFavorite) {
      await onFavorite(quote.id)
    }

    setIsFavoriting(false)
  }

  const portrait = quote.person.portraits[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card variant="elevated" className="p-8 max-w-3xl mx-auto my-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Portrait */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200">
              {portrait?.imageUrl ? (
                <Image
                  src={portrait.imageUrl}
                  alt={quote.person.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {quote.person.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Person name and category */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {quote.person.name}
              </h3>
              {quote.person.category && (
                <p className="text-sm text-gray-500 capitalize">
                  {quote.person.category}
                </p>
              )}
            </div>

            {/* Quote text */}
            <blockquote className="text-2xl text-gray-800 font-serif italic mb-4">
              "{quote.text}"
            </blockquote>

            {/* Metadata */}
            {(quote.date || quote.originName) && (
              <div className="text-sm text-gray-600 mb-4">
                {quote.date && <span>{quote.date}</span>}
                {quote.date && quote.originName && <span> • </span>}
                {quote.originName && (
                  <span>
                    {quote.origin && `${quote.origin}: `}
                    {quote.originName}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {quote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quote.tags.map(({ tag }) => (
                  <Tag
                    key={tag.id}
                    label={tag.name}
                    onClick={onTagClick ? () => onTagClick(tag.slug) : undefined}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Upvote/Downvote */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(quote.userVote === 1 ? 0 : 1)}
                  disabled={isVoting || !onVote}
                  className={`p-2 rounded-full transition-colors ${
                    quote.userVote === 1
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                  } disabled:opacity-50`}
                  title="Upvote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {quote.upvotes - quote.downvotes}
                </span>
                <button
                  onClick={() => handleVote(quote.userVote === -1 ? 0 : -1)}
                  disabled={isVoting || !onVote}
                  className={`p-2 rounded-full transition-colors ${
                    quote.userVote === -1
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                  } disabled:opacity-50`}
                  title="Downvote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Favorite */}
              <button
                onClick={handleFavorite}
                disabled={isFavoriting || (!onFavorite && !onUnfavorite)}
                className={`p-2 rounded-full transition-colors ${
                  quote.isFavorited
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                } disabled:opacity-50`}
                title={quote.isFavorited ? 'Unfavorite' : 'Favorite'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill={quote.isFavorited ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={quote.isFavorited ? 0 : 2}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
