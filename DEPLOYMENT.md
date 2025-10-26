# Deployment Guide - Famous Quotes

This guide will walk you through deploying your Famous Quotes application to production.

## Recommended: Vercel + Supabase (100% Free)

This is the easiest and most cost-effective option.

---

## Step-by-Step Deployment

### Part 1: Set Up Database (Supabase)

#### 1. Create Supabase Account
- Go to [supabase.com](https://supabase.com)
- Click "Start your project"
- Sign up with GitHub (recommended) or email

#### 2. Create New Project
- Click "New Project"
- Fill in:
  - **Name**: famous-quotes
  - **Database Password**: Generate a strong password (SAVE THIS!)
  - **Region**: Choose closest to your users
  - **Pricing Plan**: Free (500MB database, plenty for this app)
- Click "Create new project"
- Wait 2-3 minutes for setup

#### 3. Get Database Connection String
- Once project is ready, click "Connect" (top right)
- Go to "Connection string" tab
- Select "URI" format
- **IMPORTANT**: Choose "Direct Connection" (not Transaction pooling)
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with the password you saved

Example:
```
postgresql://postgres.abcdefghijk:YourPassword123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### 4. Test Database Locally (Optional)
Before deploying, test the connection:

```bash
# Add to your .env file
DATABASE_URL="your-supabase-connection-string"

# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push
```

If successful, you'll see "Your database is now in sync with your schema."

---

### Part 2: Deploy to Vercel

#### 1. Prepare Your Code

First, ensure your code is ready:

```bash
cd famous-quotes

# Make sure everything builds
npm run build
```

If build succeeds, you're ready!

#### 2. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Create .gitignore (should already exist)
# Make sure it includes:
# - node_modules/
# - .env
# - .env*.local

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Famous Quotes app"
```

#### 3. Push to GitHub

**Option A: Create repo via GitHub.com**

1. Go to [github.com](https://github.com)
2. Click "+" (top right) → "New repository"
3. Name it: `famous-quotes`
4. Keep it Public or Private (your choice)
5. **Do NOT** initialize with README (you already have files)
6. Click "Create repository"

7. Follow the commands shown (similar to):
```bash
git remote add origin https://github.com/YOUR-USERNAME/famous-quotes.git
git branch -M main
git push -u origin main
```

**Option B: Create repo via GitHub CLI**

```bash
# Install GitHub CLI: https://cli.github.com/
gh auth login
gh repo create famous-quotes --private --source=. --push
```

#### 4. Deploy to Vercel

**Option A: Via Vercel Website (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Import Project" or "Add New..."
5. Select "Import Git Repository"
6. Find your `famous-quotes` repository
7. Click "Import"

**Configure Project:**
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

**Environment Variables** - Click "Add" for each:
```
DATABASE_URL = your-supabase-connection-string
NODE_ENV = production
```

8. Click "Deploy"
9. Wait 2-3 minutes for deployment

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? famous-quotes
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
# Paste your Supabase connection string

# Deploy to production
vercel --prod
```

#### 5. Your App is Live!

Vercel will give you a URL like:
```
https://famous-quotes-abc123.vercel.app
```

Visit it and your app should be running!

---

### Part 3: Set Up Your Production Database

Your database exists but is empty. You need to add data.

#### Option 1: Import via Seed Script

1. **Prepare your data** in `data/seeds/quotes-data.json`

2. **Run seed script with production database**:

Create a temporary `.env.production` file:
```bash
DATABASE_URL="your-supabase-connection-string"
```

Then run:
```bash
# Use production database
export DATABASE_URL="your-supabase-connection-string"  # Mac/Linux
# OR
set DATABASE_URL=your-supabase-connection-string  # Windows

# Run seed
npm run db:seed
```

#### Option 2: Use Admin Panel

1. Create your admin user directly in Supabase:
   - Go to Supabase dashboard
   - Click "Table Editor" (left sidebar)
   - Select "User" table
   - Click "Insert" → "Insert row"
   - Fill in:
     ```
     email: admin@example.com
     username: admin
     passwordHash: [generate with bcrypt - see below]
     isAdmin: true
     createdAt: now()
     updatedAt: now()
     ```
   - Click "Save"

2. **Generate password hash**:

   Create `hash.js` in your project:
   ```javascript
   const bcrypt = require('bcryptjs');
   const password = 'YourSecurePassword123!';
   console.log(bcrypt.hashSync(password, 10));
   ```

   Run: `node hash.js`

   Copy the output and paste into `passwordHash` field.

3. **Login to your deployed app**:
   - Go to `https://your-app.vercel.app/login`
   - Login with admin credentials
   - Go to `/admin` and start adding content!

---

## Post-Deployment Checklist

### ✅ Test Everything

Visit your deployed site and test:

- [ ] Home page loads
- [ ] Search and filters work
- [ ] Can register new account
- [ ] Can login with admin account
- [ ] Admin dashboard accessible at `/admin`
- [ ] Can add persons via admin panel
- [ ] Can add quotes via admin panel
- [ ] Quotes appear on home feed
- [ ] Can upvote/downvote quotes (when logged in)
- [ ] Can favorite quotes
- [ ] Favorites page shows saved quotes

### 🐛 Common Issues & Fixes

**Issue: "Database connection failed"**
- Check DATABASE_URL environment variable in Vercel
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Ensure DATABASE_URL is set correctly
- After updating, redeploy: Vercel Dashboard → Deployments → Click "..." → "Redeploy"

**Issue: "Cannot find module '@prisma/client'"**
- Vercel needs to generate Prisma client during build
- Add to `package.json` scripts:
  ```json
  "postinstall": "prisma generate"
  ```
- Push to GitHub, Vercel will auto-redeploy

**Issue: "Images not loading"**
- Make sure portrait images are in `public/portraits/` folder
- Commit and push images to GitHub
- Images must be in the repository to deploy

**Issue: "Page not found"**
- Might be caching issue
- In Vercel Dashboard, go to Deployments
- Click "..." on latest deployment → "Redeploy"

---

## Custom Domain (Optional)

Want `famousquotes.com` instead of `famous-quotes-abc123.vercel.app`?

### 1. Buy a Domain
- [Namecheap](https://www.namecheap.com) - $8-15/year
- [Google Domains](https://domains.google.com)
- [Cloudflare](https://www.cloudflare.com/products/registrar/) - At-cost pricing

### 2. Add to Vercel
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Enter your domain: `famousquotes.com`
4. Click "Add"

### 3. Configure DNS
Vercel will show you DNS records to add. In your domain registrar:

Add these records:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait 5-60 minutes for DNS to propagate. Then your site is live at your domain!

---

## Environment Variables Reference

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
```bash
DATABASE_URL=postgresql://postgres.xxx:password@xxx.supabase.com:5432/postgres
NODE_ENV=production
```

**Optional (if you add these features):**
```bash
# hCaptcha (for real CAPTCHA on registration)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key
HCAPTCHA_SECRET_KEY=your_secret_key

# Cloudinary (for image uploads instead of local storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Ongoing Maintenance

### Deploying Updates

Every time you push to GitHub, Vercel auto-deploys:

```bash
# Make changes to code
# Test locally
npm run dev

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push

# Vercel automatically deploys!
# Check Vercel dashboard for deployment status
```

### Monitoring

**Check Logs:**
- Vercel Dashboard → Your Project → Functions
- Click on any function to see logs
- Useful for debugging production errors

**Database Usage:**
- Supabase Dashboard → Settings → Usage
- Free tier: 500MB storage, 2GB bandwidth/month
- Monitor to ensure you don't exceed limits

### Backups

**Database Backups (Important!):**

Supabase automatically backs up daily, but you can also:

```bash
# Backup to local file
pg_dump YOUR_SUPABASE_CONNECTION_STRING > backup.sql

# Restore from backup
psql YOUR_SUPABASE_CONNECTION_STRING < backup.sql
```

Or use Supabase Dashboard → Database → Backups (paid feature)

---

## Alternative Deployment Options

### Option 2: Railway (Alternative to Vercel)

Railway provides both hosting AND database in one place.

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `famous-quotes` repository
6. Railway auto-detects Next.js
7. Click "Add PostgreSQL" to create database
8. Railway automatically sets DATABASE_URL
9. Deploy!

**Pros:**
- Database and app in one place
- Simple setup

**Cons:**
- Free tier is $5 credit (lasts 1-2 months)
- After credit runs out, costs $5-10/month

### Option 3: Netlify + Supabase

Similar to Vercel, also free:

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. "Add new site" → "Import from Git"
4. Select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add DATABASE_URL environment variable
7. Deploy

### Option 4: Self-Host (VPS)

If you want full control:

**Requirements:**
- VPS (DigitalOcean, Linode, Vultr): $5-10/month
- Domain name: $10/year

**Steps:**
1. Set up Ubuntu server
2. Install Node.js, PostgreSQL
3. Clone your repo
4. Run `npm install && npm run build`
5. Use PM2 to run: `pm2 start npm --name "quotes" -- start`
6. Set up Nginx as reverse proxy
7. Get SSL certificate with Certbot

(This is more complex - only recommended if you have experience)

---

## Cost Breakdown

### Recommended Setup (Vercel + Supabase):
- **Hosting (Vercel)**: $0/month
  - Free tier: Unlimited deployments
  - 100GB bandwidth
  - Perfect for this project

- **Database (Supabase)**: $0/month
  - Free tier: 500MB storage
  - 2GB bandwidth
  - Enough for 5,000+ quotes

- **Domain (Optional)**: $10-15/year
  - Only if you want custom domain

**Total: $0/month (or $1.25/month with domain)**

### At Scale (If app grows):
- **Vercel Pro**: $20/month (more bandwidth, analytics)
- **Supabase Pro**: $25/month (8GB storage, better performance)
- **Total**: $45/month (only needed if you get thousands of users)

---

## Quick Deploy Checklist

Use this for fast deployment:

### Pre-Deploy:
- [ ] Code builds successfully (`npm run build`)
- [ ] Create Supabase account and project
- [ ] Get DATABASE_URL from Supabase
- [ ] Push code to GitHub

### Deploy:
- [ ] Sign up for Vercel with GitHub
- [ ] Import `famous-quotes` repository
- [ ] Add DATABASE_URL environment variable
- [ ] Deploy (wait 2-3 minutes)
- [ ] Visit your live URL

### Post-Deploy:
- [ ] Create admin user in Supabase Table Editor
- [ ] Login to deployed app
- [ ] Add persons and quotes via admin panel
- [ ] Test quote feed works
- [ ] Share your live link!

---

## Getting Help

**Vercel Issues:**
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**Supabase Issues:**
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

**Next.js Issues:**
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

## Next Steps After Deployment

1. **Add Content**: Use admin panel to add 50-100 quotes
2. **Generate Portraits**: Create images for your persons
3. **Share**: Share your live URL on social media
4. **Monitor**: Check Vercel analytics to see traffic
5. **Iterate**: Add more features based on user feedback

---

## Summary

**Fastest Path to Production:**

1. Create Supabase project (5 min)
2. Push to GitHub (2 min)
3. Import to Vercel (3 min)
4. Add DATABASE_URL (1 min)
5. Deploy (3 min)
6. Create admin user (2 min)
7. Add quotes (10 min)

**Total time: ~30 minutes to live deployment!**

Your app will be live at: `https://famous-quotes-xyz.vercel.app`

---

**You're ready to deploy! 🚀**

Follow the steps above and your Famous Quotes app will be live on the internet in under 30 minutes!
