# FrameOne

   FrameOne is a cinematic movie and TV discovery app built with Next.js, React, and Tailwind CSS. It helps users browse trending titles, explore curated collections, search for titles, open rich detail views, and save favorites/watchlists across sessions.

   The app uses TMDB for catalog data and imagery, Prisma + PostgreSQL for persistence, and Auth.js for credentials-based authentication.

   ## Why FrameOne

   - Discover movies and TV shows through a polished home experience
   - Explore popular, trending, top-rated, and genre-based collections
   - Search titles quickly and navigate to a detail view with cast, similar titles, and trailers
   - Keep track of movies with personal favorites and watchlists
   - Manage account details, avatars, and saved browsing preferences

   ## Features

   - Home hero carousel with rotating featured titles
   - Movie and TV browsing rows for trending, popular, and top-rated content
   - Genre-based discovery and selection
   - Search experience for titles and related media
   - Detailed movie/TV pages with metadata, trailer support, cast, and recommendations
   - Personalized favorites and watchlist tracking
   - Sign up / sign in flow with profile editing and avatar uploads

   ## Tech stack

   - Next.js 16 (App Router)
   - React 19
   - Tailwind CSS 4
   - Prisma 7 + PostgreSQL
   - Auth.js (NextAuth v5)
   - TMDB API for metadata, posters, trailers, and images
   - Optional Upstash Redis for shared TMDB response caching
   - Optional S3-compatible storage for avatar uploads

   ## Prerequisites

   Before you start, make sure you have:

   - Node.js 20+ and npm
   - A PostgreSQL database
   - A TMDB API key from the TMDB settings page

   ## Getting started

   ### 1) Install dependencies

   ```bash
   npm install
   ```

   ### 2) Configure environment variables

   Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum, configure:

   - `TMDB_API_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`

   Generate an auth secret locally:

   ```bash
   openssl rand -base64 32
   ```

   For local development, set:

   ```bash
   AUTH_URL=http://localhost:3000
   ```

   If your PostgreSQL provider uses separate pooled and direct connections, configure both `DATABASE_URL` and `DIRECT_URL` as shown in `.env.example`.

   ### 3) Apply database migrations

   ```bash
   npm run db:migrate
   ```

   ### 4) Start the app

   ```bash
   npm run dev
   ```

   Then open http://localhost:3000 in your browser.

   ## Optional services

   ### Upstash Redis

   Set the following variables to enable a shared TMDB cache:

   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

   The app includes in-memory and fetch-cache fallbacks if Redis is unavailable.

   ### S3-compatible avatar storage

   Configure the `S3_*` environment variables to enable avatar upload support. Avatars are served via routes under `/api/avatars/[userId]`.

   Keep secrets in `.env.local` or your deployment platform's environment settings. Never commit secret values.

   ## Available scripts

   | Command | Description |
   | --- | --- |
   | `npm run dev` | Start the development server |
   | `npm run build` | Generate Prisma client and build the app |
   | `npm run start` | Start the production server |
   | `npm run lint` | Run ESLint |
   | `npm run db:generate` | Generate the Prisma client |
   | `npm run db:migrate` | Apply pending Prisma migrations |
   | `npm run db:studio` | Open Prisma Studio |

   ## Project structure

   ```text
   app/                 # Next.js App Router pages and API routes
   components/          # Reusable UI components
   lib/                 # TMDB, auth, cache, and helper logic
   prisma/              # Prisma schema and migrations
   public/              # Static assets
   auth.ts              # Auth.js configuration
   auth.config.ts       # Auth-related config
   middleware.ts        # Edge middleware
   ```

   ## Attribution

   This product uses the TMDB API but is not endorsed or certified by TMDB.
