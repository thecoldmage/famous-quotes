import { z } from 'zod'

// User registration validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  captchaToken: z.string().min(1, 'Please complete the captcha'),
})

// User login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Person validation
export const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  biography: z.string().min(20, 'Biography must be at least 20 characters'),
  isRealPerson: z.boolean().default(true),
  category: z.string().optional(),
})

// Quote validation
export const quoteSchema = z.object({
  text: z.string().min(5, 'Quote must be at least 5 characters'),
  personId: z.string().cuid('Invalid person ID'),
  date: z.string().optional(),
  origin: z.string().optional(),
  originName: z.string().optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
})

// Tag validation
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  slug: z.string().min(1, 'Tag slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
})

// Portrait validation
export const portraitSchema = z.object({
  personId: z.string().cuid('Invalid person ID'),
  imageUrl: z.string().url('Invalid image URL'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  isPrimary: z.boolean().default(false),
})

// Search/filter validation
export const searchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Vote validation
export const voteSchema = z.object({
  quoteId: z.string().cuid('Invalid quote ID'),
  value: z.number().int().min(-1).max(1), // -1 for downvote, 1 for upvote
})

// Profanity filter validation
export const profanityFilterSchema = z.object({
  term: z.string().min(1, 'Term is required').toLowerCase(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PersonInput = z.infer<typeof personSchema>
export type QuoteInput = z.infer<typeof quoteSchema>
export type TagInput = z.infer<typeof tagSchema>
export type PortraitInput = z.infer<typeof portraitSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type VoteInput = z.infer<typeof voteSchema>
export type ProfanityFilterInput = z.infer<typeof profanityFilterSchema>
