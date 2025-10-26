# Famous Quotes Feed

A modern web application for browsing, searching, and curating quotes from famous people and fictional characters.

## Features

- **Infinite Scroll Feed**: Vertically scrolling feed with animated quote cards
- **Rich Quote Cards**: Display person portraits, names, quotes, and metadata
- **User Engagement**: Upvote/downvote and favorite quotes
- **Smart Search**: Search by quote text or filter by category tags
- **User Accounts**: Secure registration with profanity filtering and CAPTCHA
- **Admin Dashboard**: Manage quotes, people, tags, and portraits
- **Portrait Generation**: Support for local AI-generated portraits (Flux models)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom auth with bcrypt
- **Validation**: Zod schemas
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted on Supabase/Railway)

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your database URL and other credentials.

3. Generate Prisma client
```bash
npm run db:generate
```

4. Push database schema
```bash
npm run db:push
```

5. Seed the database (optional, after you've added data)
```bash
npm run db:seed
```

6. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Option 1: Local PostgreSQL

Install PostgreSQL locally and create a database:
```bash
createdb famous_quotes
```

Update `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/famous_quotes"
```

### Option 2: Supabase (Free Tier)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `.env` with the connection string

### Option 3: Railway (Free Tier)

1. Create account at [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection string
4. Update `.env`

## Data Collection

See [data/README.md](./data/README.md) for detailed instructions on collecting and importing quote data.

### Quick Start:

1. Copy template:
```bash
cp data/quotes-template.json data/seeds/quotes-data.json
```

2. Edit `data/seeds/quotes-data.json` with your quotes

3. Run seed script:
```bash
npm run db:seed
```

## Project Structure

```
famous-quotes/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── quotes/       # Quote CRUD
│   │   ├── admin/        # Admin endpoints
│   │   └── user/         # User endpoints
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── quotes/       # Quote-specific components
│   │   └── auth/         # Auth forms
│   ├── lib/              # Utility functions
│   │   ├── prisma.ts     # Database client
│   │   ├── auth.ts       # Auth utilities
│   │   ├── validations.ts # Zod schemas
│   │   └── profanity.ts  # Profanity filter
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── data/
│   ├── seeds/            # Seed data
│   └── README.md         # Data collection guide
└── public/
    └── portraits/        # Portrait images
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with quote data

## Portrait Generation Workflow

Since we're using local Flux models for zero-cost image generation:

1. Run seed script - generates portrait prompts
2. Open Prisma Studio: `npm run db:studio`
3. View `Portrait` table to see generated prompts
4. Copy prompts to your Flux workflow
5. Generate images
6. Save images to `public/portraits/[person-name].jpg`
7. Update `imageUrl` in Portrait table with `/portraits/[person-name].jpg`

## Deployment

### Vercel (Recommended for Frontend)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Database Hosting

- **Supabase**: Free tier, 500MB
- **Railway**: Free tier with usage limits
- **Neon**: Serverless PostgreSQL, free tier

## Environment Variables

Required variables:

```env
DATABASE_URL=              # PostgreSQL connection string
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=  # hCaptcha site key
HCAPTCHA_SECRET_KEY=       # hCaptcha secret key
```

Optional:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

## Roadmap

- [ ] Complete authentication system
- [ ] Build quote feed with infinite scroll
- [ ] Implement search and filtering
- [ ] Create admin dashboard
- [ ] Add vote/favorite functionality
- [ ] Build user profile pages
- [ ] Implement portrait upload system
- [ ] Add analytics and stats
- [ ] Mobile optimization
- [ ] PWA support
