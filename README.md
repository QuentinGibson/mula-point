
# Mula Point - Modern Full-Stack Starter Template

## Features

### Core Stack

- **Next.js 15.4** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **Convex** - Real-time backend with TypeScript API
- **Clerk** - Complete authentication solution

### Pre-configured Integrations

- Real-time data synchronization with Convex
- User authentication and session management with Clerk
- Responsive UI components with Tailwind CSS
- Type-safe API calls between frontend and backend
- Development optimizations with Turbopack

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- Git for version control
- Accounts on [Convex](https://convex.dev) and [Clerk](https://clerk.com)

### Setup Instructions

1. **Clone and Install**

   ```bash
   git clone <your-repo-url>
   cd mula-point
   pnpm install
   ```

2. **Configure Convex Backend**

   ```bash
   npx convex dev
   ```

   This will:
   - Create a new Convex project (or connect to existing)
   - Generate TypeScript types
   - Start the Convex development server
   - Create a `.env.local` file with your Convex URL

3. **Configure Clerk Authentication**

   Create a Clerk application at [clerk.com](https://clerk.com)
   and add these to `.env.local`:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CONVEX_SITE_URL=http://localhost:3000
   ```

   Update your Clerk JWT template with the Convex issuer domain
   from your Convex dashboard.

4. **Start Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
mula-point/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page with auth
│   │   └── pricing/         # Example pricing page
│   ├── components/          # React components
│   │   └── ConvexClientProvider.tsx
│   └── lib/                 # Utility functions
│       └── utils.ts
├── convex/                  # Backend API
│   ├── _generated/          # Auto-generated types
│   ├── auth.config.ts       # Clerk auth configuration
│   └── messages.ts          # Example API endpoint
├── public/                  # Static assets
└── middleware.tsx           # Next.js middleware

```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy!

### Deploy Convex Backend

```bash
npx convex deploy --prod
```

## Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
npx convex dev    # Start Convex dev server
npx convex deploy # Deploy Convex to production
```

## Environment Variables

Create a `.env.local` file with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Customize Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Next Steps

Make sure to test all these feature before working on a new clone

- [x] Add UI component library (shadcn/ui, Material-UI, etc.)
- [x] Set up CI/CD pipeline
- [x] Implement error tracking (Sentry)
- [x] Configure rate limiting
- [x] Add analytics (PostHog)
- [ ] CMS
- [ ] Scaffold basic ui with mock data
- [ ] Add testing framework

## New Projects


- [ ] Add UI component library (shadcn/ui, Material-UI, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Implement error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Add analytics (PostHog)
- [ ] CMS
- [ ] Scaffold basic ui with mock data
- [ ] Add testing framework

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

- [Clerk Nextjs Quickstart Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Billing Documentation] (https://clerk.com/docs/nextjs/billing/b2c-saas)

- [Convex Rate Limiter Documentation](https://www.convex.dev/components/rate-limiter)
- [Convex with tanStack Query Documentation](https://docs.convex.dev/client/tanstack-query)


## License

MIT
