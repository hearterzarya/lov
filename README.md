# EliteBytes Admin

License management panel for EliteBytes browser extension.

## Setup

1. Create NeonDB project at https://console.neon.tech
2. Copy connection string
3. Update `.env` with DATABASE_URL and DIRECT_URL
4. Install deps: `npm install`
5. Run migration: `npx prisma migrate dev --name init`
6. Start dev: `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add env vars in Vercel dashboard
4. Run `npx prisma migrate deploy` against production DB
