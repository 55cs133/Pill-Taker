# Legacy Features Inventory

This document catalogs all features from the legacy Pill-Taker application (located in `legacy/`) to support their reintegration into the new Next.js codebase.

## Authentication

- [ ] User registration (name, email, password with bcrypt hashing)
- [ ] User login (email + password, JWT cookie-based session with 20-day expiry)
- [ ] User logout (session cookie clearing)
- [ ] Session verification middleware (JWT token validation on protected routes)

## Treatment Management

- [ ] Create treatment (name, interval in hours, list of medicines)
- [ ] Each medicine has: name, dosage, quantity
- [ ] List user's treatments (scoped to authenticated user, ordered by creation date)
- [ ] Each treatment is assigned a unique UUID slug

## QR Code Dose Tracking

- [ ] Generate SVG QR code per treatment (encodes a public flash URL with the treatment slug)
- [ ] Flash endpoint: public (no auth) dose recording via QR scan
- [ ] Dose model tracks confirmation method (`qr_scan` or `manual`)

## Dose History

- [ ] View dose history per treatment (ordered by most recent)
- [ ] Each dose records: timestamp, confirmation method

## Telegram Bot Integration

- [ ] Generate a temporary token-based link URL to connect a Telegram account (1-hour expiry)
- [ ] Webhook handler for Telegram `/start` command to link a user's chat ID
- [ ] Send Telegram notification on dose confirmation

## Email Reminders

- [ ] SMTP-based email reminders for upcoming doses

## User Profile

- [ ] Fetch authenticated user info (name, email)

## Frontend UI Components

- [ ] Login / registration form with toggle between modes
- [ ] Treatment list with expandable QR code display and dose history
- [ ] Treatment creation form with dynamic medicine fields (add multiple medicines)
- [ ] Telegram link component (generate link, show deep-link URL)

## Infrastructure & Deployment

- [ ] PostgreSQL database
- [ ] Docker Compose setup (backend, frontend, PostgreSQL)

## Testing

- [ ] Backend unit tests (auth, treatments, flash, telegram)
- [ ] Frontend unit tests (App, LoginForm, TreatmentList, TreatmentForm)
- [ ] E2E API tests with Playwright (full user journey)
