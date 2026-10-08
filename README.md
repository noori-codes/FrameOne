# FrameOne

FrameOne is a cinematic movie and TV discovery app built with Next.js, React,
and Tailwind CSS. Browse trending titles, explore genres, search films, open
detail pages with trailers, and save movies to personal Favorites and Watchlist
collections. Accounts also support profile details and avatars.

Catalog data and images come from [TMDB](https://www.themoviedb.org/). User
accounts and saved lists are stored in PostgreSQL with Prisma. Auth is handled
by Auth.js (NextAuth v5).

## Features

- Home hero carousel with daily-rotated movie picks
- Trending / popular / top-rated movie rows and infinite browse grids
- Trending TV series row with series detail pages (`/tv/[id]`)
- Genre discovery for movies
- Movie search, trailers, cast, and similar titles
- Favorites and watchlist (movies; series lists coming later)
- Sign up / sign in, profile editing, and avatar uploads

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS 4**
- **Prisma 7** + PostgreSQL
- **Auth.js** (credentials)
- **TMDB API** (movies + TV)
- Optional **Upstash Redis** for shared TMDB response caching
- Optional **S3-compatible** storage for avatars

## Getting started

### Prerequisites

- Node.js and npm
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A PostgreSQL database for account and list features

### Install and configure

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values for your
   environment. At minimum, set `TMDB_API_KEY`, `DATABASE_URL`, and
   `AUTH_SECRET`. Generate an auth secret with:

   ```bash
   openssl rand -base64 32
   ```

   For local development, set `AUTH_URL` to `http://localhost:3000`. The
   database URL should point to your PostgreSQL database. If your provider
   requires separate pooled and direct connections, configure both
   `DATABASE_URL` and `DIRECT_URL` as described in `.env.example`.

3. Apply the database migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Optional services

- **Upstash Redis:** Set `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` for a shared TMDB response cache. The app also
  keeps an in-memory cache and falls back to the Next.js fetch cache if Redis
  is slow or unset.
- **S3-compatible storage:** Configure the `S3_*` variables in `.env.example`
  to enable avatar storage. Avatars are served through `/api/avatars/[userId]`.

Keep secrets in `.env.local` or your deployment provider's environment
settings. Do not commit secret values.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate the Prisma client and build the app |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
