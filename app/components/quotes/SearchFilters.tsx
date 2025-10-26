'use client'

import { useState, useEffect } from 'react'
import { useFilterStore } from '@/lib/store'
import { apiClient } from '@/lib/api-client'
import Input from '../ui/Input'
import Tag from '../ui/Tag'

interface TagData {
  id: string
  name: string
  slug: string
  quoteCount: number
}

export default function SearchFilters() {
  const [tags, setTags] = useState<TagData[]>([])
  const [searchInput, setSearchInput] = useState('')
  const { selectedTags, searchQuery, sortBy, toggleTag, setSearchQuery, setSortBy } =
    useFilterStore()

  useEffect(() => {
    // Fetch tags
    apiClient.getTags().then((response) => {
      if (response.success && response.data && Array.isArray(response.data)) {
        setTags(response.data as TagData[])
      }
    })
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search quotes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Sort */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'recent', label: 'Recent' },
              { value: 'popular', label: 'Popular' },
              { value: 'random', label: 'Random' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Filter by tags:</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag
                  key={tag.id}
                  label={`${tag.name} (${tag.quoteCount})`}
                  onClick={() => toggleTag(tag.slug)}
                  active={selectedTags.includes(tag.slug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active filters */}
        {(selectedTags.length > 0 || searchQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Active filters: {selectedTags.length + (searchQuery ? 1 : 0)}
              </span>
              <button
                onClick={() => {
                  setSearchInput('')
                  setSearchQuery('')
                  useFilterStore.getState().reset()
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
