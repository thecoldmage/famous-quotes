'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Image from 'next/image'

interface Person {
  id: string
  name: string
  portraits: Portrait[]
}

interface Portrait {
  id: string
  imageUrl: string
  prompt: string
  isPrimary: boolean
}

export default function PortraitsManagementPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPortrait, setEditingPortrait] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  const handleUpdatePortrait = async (portraitId: string) => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const response = await apiClient.adminUpdatePortrait(portraitId, {
      imageUrl: imageUrl.trim(),
      isPrimary: true,
    })

    if (response.success) {
      setSuccess('Portrait updated successfully!')
      setEditingPortrait(null)
      setImageUrl('')
      fetchPersons()
    } else {
      setError(response.error || 'Failed to update portrait')
    }

    setIsSubmitting(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Prompt copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portraits Management</h1>
        <p className="text-gray-600 mt-1">
          Copy prompts, generate images with Flux, and upload URLs
        </p>
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

      {/* Instructions */}
      <Card variant="bordered" className="p-6 mb-8 bg-blue-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Generate Portraits:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Copy the portrait prompt for a person</li>
          <li>Use your local Flux workflow to generate the image</li>
          <li>Save the image to <code className="bg-white px-2 py-1 rounded">public/portraits/person-name.jpg</code></li>
          <li>Enter the image path (e.g., <code className="bg-white px-2 py-1 rounded">/portraits/person-name.jpg</code>) below</li>
          <li>Click "Update Portrait" to save</li>
        </ol>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {persons.map((person) => {
            const portrait = person.portraits[0]

            return (
              <Card key={person.id} variant="bordered" className="p-6">
                <div className="flex gap-6">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                      {portrait?.imageUrl ? (
                        <Image
                          src={portrait.imageUrl}
                          alt={person.name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400">
                          {person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      {portrait?.imageUrl ? (
                        <span className="text-xs text-green-600">Has portrait</span>
                      ) : (
                        <span className="text-xs text-gray-500">No portrait</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {person.name}
                    </h3>

                    {portrait && (
                      <>
                        {/* Prompt */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              Portrait Generation Prompt:
                            </label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(portrait.prompt)}
                            >
                              Copy Prompt
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-200">
                            {portrait.prompt}
                          </div>
                        </div>

                        {/* Image URL Input */}
                        {editingPortrait === portrait.id ? (
                          <div className="space-y-3">
                            <Input
                              label="Image URL"
                              placeholder="/portraits/person-name.jpg"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              helperText="Path relative to public folder, e.g. /portraits/albert-einstein.jpg"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdatePortrait(portrait.id)}
                                isLoading={isSubmitting}
                              >
                                Update Portrait
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPortrait(null)
                                  setImageUrl('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {portrait.imageUrl && (
                              <span className="text-sm text-gray-600">
                                Current: {portrait.imageUrl}
                              </span>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setEditingPortrait(portrait.id)
                                setImageUrl(portrait.imageUrl || '')
                              }}
                            >
                              {portrait.imageUrl ? 'Update' : 'Add'} Image URL
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
