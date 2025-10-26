import { prisma } from './prisma'
import { seedProfanityFilter } from './profanity'
import { generatePortraitPrompt } from './portrait-prompt'

interface QuoteData {
  text: string
  date?: string | null
  origin?: string | null
  originName?: string | null
  tags: string[]
}

interface PersonData {
  name: string
  description: string
  biography: string
  isRealPerson: boolean
  category?: string
  quotes: QuoteData[]
}

interface SeedData {
  persons: PersonData[]
}

export async function seedDatabase(data: SeedData) {
  console.log('Starting database seed...')

  // Seed profanity filter first
  console.log('Seeding profanity filter...')
  await seedProfanityFilter()

  // Create tags map for efficiency
  const tagsMap = new Map<string, string>()

  console.log(`Processing ${data.persons.length} persons...`)

  for (const personData of data.persons) {
    console.log(`\nProcessing: ${personData.name}`)

    // Create or update person
    const person = await prisma.person.upsert({
      where: { name: personData.name },
      update: {
        description: personData.description,
        biography: personData.biography,
        isRealPerson: personData.isRealPerson,
        category: personData.category,
      },
      create: {
        name: personData.name,
        description: personData.description,
        biography: personData.biography,
        isRealPerson: personData.isRealPerson,
        category: personData.category,
      },
    })

    console.log(`  ✓ Person created/updated`)

    // Generate portrait prompt
    const prompt = generatePortraitPrompt({
      name: person.name,
      description: person.description,
      biography: person.biography,
      isRealPerson: person.isRealPerson,
      category: person.category,
    })

    // Create portrait entry (without image URL - to be filled manually)
    await prisma.portrait.upsert({
      where: {
        personId: person.id,
      },
      update: {
        prompt,
      },
      create: {
        personId: person.id,
        imageUrl: '', // Will be filled later when image is generated
        prompt,
        isPrimary: true,
      },
    })

    console.log(`  ✓ Portrait prompt generated`)

    // Process quotes
    for (const quoteData of personData.quotes) {
      // Create quote
      const quote = await prisma.quote.create({
        data: {
          text: quoteData.text,
          personId: person.id,
          date: quoteData.date || null,
          origin: quoteData.origin || null,
          originName: quoteData.originName || null,
        },
      })

      // Process tags
      for (const tagName of quoteData.tags) {
        let tagId = tagsMap.get(tagName)

        if (!tagId) {
          // Create tag if it doesn't exist
          const tag = await prisma.tag.upsert({
            where: { slug: tagName },
            update: {},
            create: {
              name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
              slug: tagName,
            },
          })
          tagId = tag.id
          tagsMap.set(tagName, tagId)
        }

        // Link quote to tag
        await prisma.quoteTag.create({
          data: {
            quoteId: quote.id,
            tagId,
          },
        })
      }

      console.log(`  ✓ Quote added: "${quoteData.text.substring(0, 50)}..."`)
    }
  }

  console.log('\n✅ Database seed completed!')
  console.log(`\nSummary:`)
  console.log(`  Persons: ${await prisma.person.count()}`)
  console.log(`  Quotes: ${await prisma.quote.count()}`)
  console.log(`  Tags: ${await prisma.tag.count()}`)
  console.log(`  Portraits: ${await prisma.portrait.count()}`)
}

// Main execution
async function main() {
  try {
    // Load data from JSON file
    const fs = require('fs')
    const path = require('path')
    const dataPath = path.join(process.cwd(), 'data', 'seeds', 'quotes-data.json')

    if (!fs.existsSync(dataPath)) {
      console.error('Error: quotes-data.json not found in data/seeds/')
      console.log('Please create the file using the template in data/quotes-template.json')
      process.exit(1)
    }

    const data: SeedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    await seedDatabase(data)
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
