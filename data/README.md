# Data Collection Guide

This directory contains templates and tools for collecting quote data for the Famous Quotes platform.

## Templates

### JSON Format (`quotes-template.json`)
Use this format for structured data entry. It supports multiple quotes per person efficiently.

**Structure:**
- `persons`: Array of person objects
  - `name`: Full name of the person/character
  - `description`: Physical description for portrait generation
  - `biography`: Brief bio (2-3 sentences)
  - `isRealPerson`: `true` for real people, `false` for fictional characters
  - `category`: Category (scientist, philosopher, author, character, etc.)
  - `quotes`: Array of quote objects
    - `text`: The quote itself
    - `date`: Year or date (optional, can be `null`)
    - `origin`: Type of source (book, movie, interview, speech, etc.)
    - `originName`: Name of the source
    - `tags`: Array of tag slugs

### CSV Format (`quotes-template.csv`)
Use this for simple spreadsheet-based data entry.

**Columns:**
- person_name
- person_description
- person_biography
- is_real_person (TRUE/FALSE)
- person_category
- quote_text
- quote_date
- quote_origin
- quote_origin_name
- tags (comma-separated)

## Data Sources (Free & Public Domain)

### Real People:
1. **Wikiquote** - https://en.wikiquote.org
   - Free, public domain quotes
   - Covers philosophers, scientists, authors, politicians

2. **Project Gutenberg** - https://www.gutenberg.org
   - Public domain books
   - Extract quotes from classic literature

3. **Wikipedia** - https://en.wikipedia.org
   - Biography information
   - Physical descriptions from article text

### Fictional Characters:
1. **Wikiquote** - Fictional character sections
2. **IMDb Quotes** - https://www.imdb.com (for film/TV)
3. **Book excerpts** from public domain works

## Categories to Cover

Target: 250-500 quotes across these categories:

- **Philosophy** (50-75 quotes)
  - Plato, Aristotle, Nietzsche, Confucius, Socrates

- **Science** (50-75 quotes)
  - Einstein, Newton, Curie, Sagan, Hawking, Feynman

- **Literature** (50-75 quotes)
  - Shakespeare, Wilde, Twain, Hemingway, Austen

- **Film/Cinema** (40-60 quotes)
  - Iconic movie quotes (The Godfather, Star Wars, etc.)
  - Directors: Kubrick, Spielberg, Scorsese

- **Video Games** (30-40 quotes)
  - Characters: GLaDOS (Portal), Kratos (God of War), etc.
  - Game designers: Miyamoto, Kojima, Meier

- **Art & Music** (30-40 quotes)
  - Artists: Picasso, Van Gogh, Warhol
  - Musicians: Mozart, Beethoven, modern musicians

- **Game Design** (20-30 quotes)
  - Sid Meier, Shigeru Miyamoto, Will Wright

## Recommended Tags

Use consistent tag naming:

- philosophy
- science
- literature
- art
- music
- film
- gaming
- love
- life
- success
- failure
- creativity
- wisdom
- humor
- inspiration
- leadership
- technology
- nature
- time
- death
- knowledge

## Import Process

Once you've collected data:

1. Save your data in `data/seeds/quotes-data.json`
2. Run the import script: `npm run seed`
3. The script will:
   - Create person records
   - Create quote records
   - Create tag records
   - Link quotes to tags
   - Generate portrait prompts

## Tips for Data Collection

1. **Start with well-known figures** - easier to find quotes and descriptions
2. **Verify quotes** - ensure they're actually attributed correctly
3. **Keep descriptions visual** - focus on appearance for portrait generation
4. **Mix categories** - variety keeps the feed interesting
5. **Tag appropriately** - use 2-4 tags per quote for best searchability
