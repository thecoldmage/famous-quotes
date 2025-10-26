import { prisma } from './prisma'

// Common profanity list - starter set
const DEFAULT_PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'bastard',
  'slut',
  'whore',
  'fag',
  'nigger',
  'nigga',
  'retard',
  'nazi',
  'hitler',
  // Leetspeak variations
  'f4ck',
  'sh1t',
  'b1tch',
  'fuk',
  'fck',
  // Add more as needed
]

export async function seedProfanityFilter() {
  for (const term of DEFAULT_PROFANITY_LIST) {
    await prisma.profanityFilter.upsert({
      where: { term },
      update: {},
      create: { term },
    })
  }
}

export async function checkProfanity(text: string): Promise<boolean> {
  const lowerText = text.toLowerCase()

  // Get all profanity terms from database
  const profanityTerms = await prisma.profanityFilter.findMany()

  // Check if any term is in the text
  for (const { term } of profanityTerms) {
    if (lowerText.includes(term)) {
      return true // Contains profanity
    }
  }

  return false // Clean
}

export async function isUsernameValid(username: string): Promise<{ valid: boolean; error?: string }> {
  // Check length
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' }
  }

  // Check format
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }

  // Check profanity
  const hasProfanity = await checkProfanity(username)
  if (hasProfanity) {
    return { valid: false, error: 'Username contains inappropriate content' }
  }

  return { valid: true }
}
