'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personSchema, PersonInput } from '@/lib/validations'
import { apiClient } from '@/lib/api-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Person {
  id: string
  name: string
  description: string
  biography: string
  isRealPerson: boolean
  category?: string | null
  _count: {
    quotes: number
  }
  portraits: any[]
}

export default function PersonsManagementPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      isRealPerson: true,
    },
  })

  useEffect(() => {
    fetchPersons()
  }, [])

  const fetchPersons = async () => {
    setIsLoading(true)
    const response = await apiClient.adminGetPersons({ limit: 100 })

    if (response.success && response.data) {
      setPersons((response.data as any).data || [])
    }

    setIsLoading(false)
  }

  const onSubmit = async (data: PersonInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const response = await apiClient.adminCreatePerson(data)

    if (response.success) {
      setSuccess('Person created successfully!')
      reset()
      setShowForm(false)
      fetchPersons()
    } else {
      setError(response.error || 'Failed to create person')
    }

    setIsSubmitting(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Persons Management</h1>
          <p className="text-gray-600 mt-1">{persons.length} persons in database</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Cancel' : '+ Add Person'}
        </Button>
      </div>

      {/* Success/Error Messages */}
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

      {/* Add Person Form */}
      {showForm && (
        <Card variant="bordered" className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Person</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              placeholder="Albert Einstein"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (for portrait generation)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Elderly man with wild white hair, prominent mustache, deep-set eyes..."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="German-born theoretical physicist who developed the theory of relativity..."
                {...register('biography')}
              />
              {errors.biography && (
                <p className="mt-1 text-sm text-red-600">{errors.biography.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category"
                placeholder="scientist, philosopher, author..."
                error={errors.category?.message}
                {...register('category')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('isRealPerson', { valueAsNumber: false })}
                >
                  <option value="true">Real Person</option>
                  <option value="false">Fictional Character</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Create Person
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Persons List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {persons.map((person) => (
            <Card key={person.id} variant="bordered" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {person.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {person.isRealPerson ? 'Real' : 'Fictional'}
                    </span>
                    {person.category && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded capitalize">
                        {person.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {person.description}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    {person.biography}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{person._count.quotes} quotes</span>
                    <span>•</span>
                    <span>
                      {person.portraits.length > 0 ? 'Has portrait' : 'No portrait'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
