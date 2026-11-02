# STATE.md — WedBook Session Memory

**Last Updated:** 2026-11-02T16:26:00+05:30
**Current Phase:** 1 (Foundation & Schema)
**Current Wave:** 1

---

## Project Summary

Wedding Auditorium Booking Platform — BookMyShow-style for Kerala wedding halls.
Project directory: `c:\Users\ABHI\OneDrive\Documents\WEDS\wed-app`

## Stack Decisions (Finalized)
- Frontend: React 18 + Vite 5 + TypeScript + Tailwind CSS v3
- State: Zustand (global) + React Query (server)
- Backend: Supabase (PostgreSQL + Auth + RLS + Storage)
- Payments: Razorpay Test Mode (client-side only, no server-side order creation in v1)
- Mobile: Capacitor v6 → Android
- Animations: GSAP + ScrollTrigger
- Routing: React Router v6 (createBrowserRouter)
- Forms: React Hook Form + Zod

## Node Environment
- Node: v24.17.0
- npm: v11.13.0

## Plans Created: 16 total
- Phase 1: 01-PLAN.md, 02-PLAN.md, 03-PLAN.md
- Phase 2: 01-PLAN.md, 02-PLAN.md, 03-PLAN.md, 04-PLAN.md
- Phase 3: 01-PLAN.md, 02-PLAN.md, 03-PLAN.md
- Phase 4: 01-PLAN.md, 02-PLAN.md
- Phase 5: 01-PLAN.md, 02-PLAN.md
- Phase 6: 01-PLAN.md, 02-PLAN.md

## Completed in Phase 1
- Plan 1.1: Vite + React + Tailwind + Dependencies Scaffold (Commits: 8bbda7e, 802ade0)

## Next Action
Execute Phase 1, Plan 2 (Supabase schema) or Plan 3 (Supabase Client + Types)

## User Setup Required Before Execution
1. Create Supabase project at supabase.com → get URL + anon key
2. Create Razorpay test account → get Key ID
3. Copy .env.example → .env.local and fill values
4. Create Supabase Storage bucket: 'auditorium-photos' (public)
5. Install Android Studio (for Phase 6)

