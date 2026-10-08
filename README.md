# FrameOne

FrameOne is a movie discovery and watchlist app built with Next.js, React, and
Tailwind CSS. Explore movies, browse by genre, search titles, view movie details
and trailers, and save titles to personal Favorites and Watchlist collections.
Accounts can also manage profile details and avatars.

Movie data and images come from [TMDB](https://www.themoviedb.org/). User
accounts and saved lists are stored in PostgreSQL with Prisma.

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
  `UPSTASH_REDIS_REST_TOKEN` to enable a shared cache for TMDB responses.
  Without them, the app continues to use the Next.js fetch cache.
- **S3-compatible storage:** Configure the `S3_*` variables in `.env.example`
  to enable avatar storage.

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
