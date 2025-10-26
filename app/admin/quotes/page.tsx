'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { apiClient } from '@/lib/api-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tag from '@/components/ui/Tag'

interface Person {
  id: string
  name: string
}

interface Quote {
  id: string
  text: string
  date?: string | null
  origin?: string | null
  originName?: string | null
  upvotes: number
  downvotes: number
  person: {
    name: string
  }
}

export default function QuotesManagementPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [quotesRes, personsRes] = await Promise.all([
      apiClient.getQuotes({ limit: 50 }),
      apiClient.adminGetPersons({ limit: 100 }),
    ])

    if (quotesRes.success && quotesRes.data) {
      setQuotes((quotesRes.data as any).data || [])
    }

    if (personsRes.success && personsRes.data) {
      setPersons((personsRes.data as any).data || [])
    }

    setIsLoading(false)
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const submitData = {
      text: data.text,
      personId: data.personId,
      date: data.date || undefined,
      origin: data.origin || undefined,
      originName: data.originName || undefined,
      tags: data.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    }

    const response = await apiClient.adminCreateQuote(submitData)

    if (response.success) {
      setSuccess('Quote created successfully!')
      reset()
      setShowForm(false)
      fetchData()
    } else {
      setError(response.error || 'Failed to create quote')
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    const response = await apiClient.adminDeleteQuote(quoteId)

    if (response.success) {
      setSuccess('Quote deleted successfully!')
      fetchData()
    } else {
      setError(response.error || 'Failed to delete quote')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes Management</h1>
          <p className="text-gray-600 mt-1">{quotes.length} quotes in database</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Cancel' : '+ Add Quote'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {showForm && (
        <Card variant="bordered" className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Quote</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Person
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('personId', { required: true })}
              >
                <option value="">Select a person...</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Text
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter the quote..."
                {...register('text', { required: true })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Date (optional)"
                placeholder="1929"
                {...register('date')}
              />
              <Input
                label="Origin Type (optional)"
                placeholder="book, interview, speech"
                {...register('origin')}
              />
              <Input
                label="Origin Name (optional)"
                placeholder="The Origin of Species"
                {...register('originName')}
              />
            </div>

            <Input
              label="Tags (comma-separated)"
              placeholder="philosophy, science, wisdom"
              helperText="Separate tags with commas"
              {...register('tags', { required: true })}
            />

            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create Quote
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} variant="bordered" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{quote.person.name}</h3>
                    {quote.date && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {quote.date}
                      </span>
                    )}
                  </div>
                  <blockquote className="text-gray-700 italic mb-3">
                    "{quote.text}"
                  </blockquote>
                  {quote.originName && (
                    <p className="text-sm text-gray-600 mb-2">
                      {quote.origin && `${quote.origin}: `}
                      {quote.originName}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>↑ {quote.upvotes}</span>
                    <span>↓ {quote.downvotes}</span>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(quote.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
