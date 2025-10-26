# Famous Quotes - Setup Guide

This guide will help you get the Famous Quotes application up and running.

## What We've Built

A complete full-stack quote feed application with:

### Backend (Complete)
- **Authentication System**: User registration, login, logout with password hashing
- **Session Management**: Cookie-based sessions
- **Quote API**: Get quotes with pagination, filtering, and search
- **Vote System**: Upvote/downvote quotes
- **Favorite System**: Save favorite quotes
- **Admin API**: CRUD operations for quotes, persons, and portraits
- **Profanity Filter**: Username validation
- **Database Schema**: 9 models covering all requirements

### Frontend (Complete)
- **Quote Feed**: Infinite scroll feed with animations
- **Search & Filters**: Search by text, filter by tags, sort by recent/popular/random
- **Quote Cards**: Beautiful animated cards with portraits, quotes, and actions
- **Responsive Design**: Mobile-friendly layout
- **State Management**: Zustand for client-side state
- **Navigation**: Header with authentication status

### Still TODO
- Login/Register pages (forms created, need pages)
- Favorites page
- Admin dashboard
- Portrait upload interface

## Quick Start

### 1. Database Setup

Choose one of these options:

#### Option A: Local PostgreSQL (Recommended for Development)

Install PostgreSQL if you haven't already, then:

```bash
# Create database
createdb famous_quotes

# Update .env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/famous_quotes"
```

#### Option B: Supabase (Free Hosted Option)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings > Database
4. Copy the connection string (Direct Connection, not Transaction)
5. Update `.env`:

```bash
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### 2. Initialize Database

```bash
cd famous-quotes

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 3. Create Initial Admin User

You'll need to manually create an admin user in the database. Use Prisma Studio:

```bash
npm run db:studio
```

This opens a database GUI at `http://localhost:5555`.

1. Go to the `User` table
2. Click "Add record"
3. Fill in:
   - email: your-email@example.com
   - username: admin
   - passwordHash: (use bcrypt to hash a password - see below)
   - isAdmin: true

To generate a password hash, run this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your-password-here', 10));
```

Or use an online bcrypt generator.

### 4. Add Sample Data

Create a file at `data/seeds/quotes-data.json` using the template:

```bash
cp data/quotes-template.json data/seeds/quotes-data.json
```

Edit `quotes-data.json` and add your quotes (at least 10-20 for testing), then:

```bash
npm run db:seed
```

This will:
- Import all persons and quotes
- Generate portrait prompts
- Create tag relationships

### 5. Generate Portraits (Optional)

Since we're using local Flux models:

1. Open Prisma Studio: `npm run db:studio`
2. View the `Portrait` table
3. Copy the `prompt` field for each person
4. Use your local Flux workflow to generate images
5. Save images to `public/portraits/[person-name].jpg` (e.g., `albert-einstein.jpg`)
6. Update the `imageUrl` in the Portrait table to `/portraits/[person-name].jpg`

**Note**: The app will work without portraits - it shows initials as placeholder.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Application

### As Regular User (Once you build login/register pages):
1. Register a new account
2. Browse quotes in the feed
3. Search for quotes
4. Filter by tags
5. Upvote/downvote quotes
6. Favorite quotes
7. View your favorites

### As Admin:
1. Login with admin account
2. Access admin dashboard (once built)
3. Create new persons
4. Add quotes
5. Manage portraits

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Quotes
- `GET /api/quotes` - Get quotes (with pagination, search, filters)
- `GET /api/quotes/[id]` - Get single quote
- `POST /api/quotes/[id]/vote` - Vote on quote
- `POST /api/quotes/[id]/favorite` - Favorite quote
- `DELETE /api/quotes/[id]/favorite` - Unfavorite quote

### User
- `GET /api/user/favorites` - Get user's favorites

### Tags
- `GET /api/tags` - Get all tags with counts

### Admin (Requires Admin)
- `POST /api/admin/quotes` - Create quote
- `PUT /api/admin/quotes/[id]` - Update quote
- `DELETE /api/admin/quotes/[id]` - Delete quote
- `POST /api/admin/persons` - Create person
- `GET /api/admin/persons` - Get all persons
- `PATCH /api/admin/portraits/[id]` - Update portrait

## Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── quotes/            # Quote endpoints
│   ├── user/              # User endpoints
│   ├── tags/              # Tags endpoint
│   └── admin/             # Admin endpoints
├── components/
│   ├── layout/            # Layout components (Header)
│   ├── quotes/            # Quote components (Feed, Card, Search)
│   ├── ui/                # Reusable UI (Button, Input, Card, Tag)
│   └── auth/              # Auth forms (TODO)
├── lib/                   # Utilities
│   ├── prisma.ts          # Database client
│   ├── session.ts         # Session management
│   ├── auth.ts            # Password hashing
│   ├── validations.ts     # Zod schemas
│   ├── profanity.ts       # Profanity filter
│   ├── portrait-prompt.ts # Portrait prompt generator
│   ├── seed.ts            # Database seeder
│   ├── store.ts           # Zustand state
│   └── api-client.ts      # API client
├── types/                 # TypeScript types
└── page.tsx               # Home page
```

## Next Steps

To complete the application, you need to build:

1. **Login Page** (`app/login/page.tsx`)
2. **Register Page** (`app/register/page.tsx`)
3. **Favorites Page** (`app/favorites/page.tsx`)
4. **Admin Dashboard** (`app/admin/page.tsx`)

Would you like me to build these remaining pages?

## Troubleshooting

### Database Connection Issues
- Check your DATABASE_URL in `.env`
- Ensure PostgreSQL is running (local) or credentials are correct (hosted)
- Try: `npm run db:push` again

### Prisma Client Not Found
- Run: `npm run db:generate`
- Restart your dev server

### Quotes Not Loading
- Check browser console for errors
- Ensure database has data: `npm run db:studio`
- Check API response in Network tab

### TypeScript Errors
- Run: `npm install`
- Restart TypeScript server in VS Code

## Additional Configuration

### CAPTCHA (Optional)
To enable CAPTCHA on registration:

1. Get free hCaptcha keys: [hcaptcha.com](https://www.hcaptcha.com/)
2. Add to `.env`:
```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key
HCAPTCHA_SECRET_KEY=your_secret_key
```

### Image Storage (Optional)
For production, use Cloudinary:

1. Create free account: [cloudinary.com](https://cloudinary.com/)
2. Add to `.env`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Deployment

See [README.md](./README.md) for deployment instructions to Vercel.
