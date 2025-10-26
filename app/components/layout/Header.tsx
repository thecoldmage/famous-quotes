'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api-client'
import { useEffect } from 'react'

export default function Header() {
  const { user, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    // Check auth status on mount
    apiClient.getCurrentUser().then((response) => {
      if (response.success && response.data && 'id' in response.data) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    })
  }, [setUser])

  const handleLogout = async () => {
    await apiClient.logout()
    logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Famous Quotes
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/favorites"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Favorites
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700">
                  {user.username}
                  {user.isAdmin && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </span>
                {user.isAdmin && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Link
                      href="/admin"
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
