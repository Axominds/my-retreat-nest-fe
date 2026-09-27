This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tenant subdomains

Each retreat is served on its own subdomain (`<slug>.myretreatnest.com`,
`<slug>.localhost:3000` for local dev) via `src/proxy.ts`, which resolves the
tenant through the backend (`GET /retreats/validate/`, headers-only).

Required env (see `../my_retreat_nest_be/example.env` for the backend side):

```bash
NEXT_PUBLIC_ROOT_DOMAIN=localhost            # apex domain (prod: myretreatnest.com)
NEXT_PUBLIC_APP_URL=http://localhost:3000    # fully-qualified apex URL (scheme required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Notes:

- Start the backend before the frontend (servenil-compose already gates on
  `GET :8000/`). If the backend is unreachable, tenant hosts render a 503
  page instead of redirecting.
- Unknown/unpublished slugs redirect to `NEXT_PUBLIC_APP_URL`; it must be an
  absolute URL pointing at the apex, otherwise tenant requests can't leave
  the subdomain.
- Sessions are per-portal: `admin` (apex `/admin`), `retreat` (tenant
  `/admin`, refresh cookie `refresh_token_retreat`), `normal` (everything
  else). Staff sessions minted before the retreat cookie existed live under
  the normal cookie — those users log in once to migrate.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
