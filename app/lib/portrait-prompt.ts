interface PortraitPromptData {
  name: string
  description: string
  biography: string
  isRealPerson: boolean
  category?: string | null
}

export function generatePortraitPrompt(person: PortraitPromptData): string {
  const { name, description, biography, isRealPerson, category } = person

  // Extract time period and context from biography
  const historicalContext = extractHistoricalContext(biography)

  // Build prompt
  let prompt = `Professional portrait photograph of ${name}, `

  // Add physical description
  prompt += `${description}. `

  // Add style based on category and era
  if (isRealPerson) {
    if (historicalContext.era) {
      prompt += `Historical portrait from the ${historicalContext.era}, `
    }
    prompt += `realistic, dignified, `
  } else {
    // Fictional character
    prompt += `character portrait, highly detailed, `
  }

  // Add category-specific styling
  if (category) {
    const categoryStyles: Record<string, string> = {
      scientist: 'scholarly, intellectual atmosphere, subtle scientific elements in background',
      philosopher: 'contemplative, wise expression, classical aesthetic',
      author: 'literary, thoughtful, surrounded by books or writing implements',
      artist: 'creative, expressive, artistic atmosphere',
      'literary character': 'book illustration style, detailed character design',
      'film character': 'cinematic, movie still quality',
      'video game character': 'game art style, detailed character design',
      musician: 'artistic, expressive, musical elements',
      politician: 'formal, authoritative, dignified',
      character: 'character concept art, detailed design',
    }

    prompt += categoryStyles[category] || 'professional, dignified'
    prompt += ', '
  }

  // Quality and style tags
  prompt += 'high quality, detailed, 4k, professional lighting, neutral background, centered composition, portrait photography'

  return prompt
}

function extractHistoricalContext(biography: string): { era?: string; century?: string } {
  const context: { era?: string; century?: string } = {}

  // Common era patterns
  const eraPatterns = [
    { pattern: /19th century/i, era: '19th century' },
    { pattern: /20th century/i, era: '20th century' },
    { pattern: /21st century/i, era: '21st century' },
    { pattern: /18th century/i, era: '18th century' },
    { pattern: /renaissance/i, era: 'Renaissance' },
    { pattern: /victorian/i, era: 'Victorian era' },
    { pattern: /medieval/i, era: 'Medieval period' },
    { pattern: /ancient/i, era: 'Ancient times' },
  ]

  for (const { pattern, era } of eraPatterns) {
    if (pattern.test(biography)) {
      context.era = era
      break
    }
  }

  return context
}

// Generate prompt variations for testing
export function generatePromptVariations(person: PortraitPromptData): string[] {
  const basePrompt = generatePortraitPrompt(person)

  return [
    basePrompt,
    basePrompt.replace('portrait photograph', 'oil painting portrait'),
    basePrompt.replace('portrait photograph', 'charcoal drawing'),
    basePrompt.replace('portrait photograph', 'digital art portrait'),
  ]
}
