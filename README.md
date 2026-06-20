# Pill-Taker

A medication tracking application built with Next.js. Track pill intake using QR codes, log doses, and receive notifications.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Linting:** ESLint 9 with `eslint-config-next`
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  app/
    layout.tsx    # Root layout
    page.tsx      # Home page
    globals.css   # Global styles
public/           # Static assets
legacy/           # Archived legacy code (excluded from build and lint)
```

## Deployment

The app is deployed on Vercel. Pushes to `master` trigger automatic deployments.

## Legacy Code

The `legacy/` directory contains the previous implementation (separate backend/frontend with Playwright E2E tests). It is excluded from the TypeScript build and ESLint checks and is kept for historical reference only.
