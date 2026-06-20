# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Build & Test

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm run lint          # Run ESLint
```

## Architecture Overview

Next.js 16 App Router application with TypeScript and Tailwind CSS 4. Deployed on Vercel.

## Conventions & Patterns

- Issue tracking uses [Linear](https://linear.app/).
- The `legacy/` directory contains the previous implementation and is excluded from build and lint.
- Pushes to `master` trigger automatic Vercel deployments.
