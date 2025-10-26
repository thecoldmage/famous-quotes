'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import Card from '@/components/ui/Card'
import Link from 'next/link'

interface Stats {
  totalQuotes: number
  totalPersons: number
  totalUsers: number
  totalTags: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    // Since we don't have a stats endpoint, we'll fetch from existing endpoints
    try {
      const [quotesRes, personsRes, tagsRes] = await Promise.all([
        apiClient.getQuotes({ limit: 1 }),
        apiClient.adminGetPersons({ limit: 1 }),
        apiClient.getTags(),
      ])

      const stats: Stats = {
        totalQuotes: (quotesRes.data as any)?.pagination?.total || 0,
        totalPersons: (personsRes.data as any)?.pagination?.total || 0,
        totalUsers: 0, // Would need separate endpoint
        totalTags: Array.isArray(tagsRes.data) ? tagsRes.data.length : 0,
      }

      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="bordered" className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Quotes</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalQuotes || 0}
          </div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Persons</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalPersons || 0}
          </div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Tags</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalTags || 0}
          </div>
        </Card>

        <Card variant="bordered" className="p-6">
          <div className="text-sm text-gray-600 mb-1">Active Users</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.totalUsers || 0}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/persons">
            <Card variant="bordered" className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Persons</h3>
                  <p className="text-sm text-gray-600">Add or edit people</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/quotes">
            <Card variant="bordered" className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Quotes</h3>
                  <p className="text-sm text-gray-600">Add or edit quotes</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/portraits">
            <Card variant="bordered" className="p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Portraits</h3>
                  <p className="text-sm text-gray-600">Upload portrait images</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Getting Started
        </h2>
        <Card variant="bordered" className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Persons</h3>
                <p className="text-sm text-gray-600">
                  Start by adding famous people or fictional characters to the database.
                  Each person needs a name, description, and biography.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Quotes</h3>
                <p className="text-sm text-gray-600">
                  Associate quotes with persons. Add tags to make them searchable by category.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Generate & Upload Portraits</h3>
                <p className="text-sm text-gray-600">
                  Copy portrait prompts, generate images using your local Flux models,
                  and upload them to complete the visual experience.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
