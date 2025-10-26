'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/persons"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Persons
              </Link>
              <Link
                href="/admin/quotes"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Quotes
              </Link>
              <Link
                href="/admin/portraits"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Portraits
              </Link>
              <hr className="my-4" />
              <Link
                href="/"
                className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ← Back to Site
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
