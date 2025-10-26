'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)

    // For now, we'll use a dummy captcha token
    // In production, you'd integrate hCaptcha here
    const submitData = {
      ...data,
      captchaToken: 'dummy-token-for-development',
    }

    const response = await apiClient.register(submitData)

    if (response.success && response.data) {
      setUser(response.data.user)
      router.push('/')
    } else {
      setError(response.error || 'Registration failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Famous Quotes and start exploring</p>
        </div>

        <Card variant="elevated" className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              helperText="We'll never share your email"
              {...register('email')}
            />

            <Input
              label="Username"
              type="text"
              placeholder="johndoe"
              error={errors.username?.message}
              helperText="3-20 characters, letters, numbers, hyphens, and underscores only"
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="Min 8 characters, with uppercase, lowercase, and number"
              {...register('password')}
            />

            {/* CAPTCHA placeholder */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-600 text-sm">
              CAPTCHA verification
              <br />
              <span className="text-xs">(In development mode, this is bypassed)</span>
            </div>

            <div className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
