# SUMMARY: Plan 2.1 — Global Layout (Header, BottomNav, LocationModal)

**Phase:** 2 — Customer Discovery & Booking Flow  
**Plan:** 01  
**Status:** Completed  
**Commits:** `c5dd134`, `03ae9c3`  

---

## Executive Summary

Constructed the global layout shell for WedBook comprising:
1. **Header component (`Header.tsx`)**: Responsive persistent navigation with brand logo ("WedBook" with Heart icon), dynamic city selector badge linked to Zustand store (`useCityStore`), desktop/tablet search input that navigates to `/city/:slug?q=query`, and authentication-aware right section (profile avatar + dropdown menu with sign-out when authenticated; Login / Register actions when unauthenticated).
2. **Layout shell (`Layout.tsx`)**: Global wrapper providing sticky header, content container with mobile bottom-padding, and responsive BottomNav.
3. **LocationModal (`LocationModal.tsx`)**: Modal overlay triggered from the city badge, querying active Kerala cities from Supabase via `@tanstack/react-query` (`useCities`), complete with loading skeletons, error/retry states, active city selection indicator, and Escape key dismissal.
4. **BottomNav (`BottomNav.tsx`)**: Mobile-only (`md:hidden`) bottom navigation bar offering 4 primary navigation tabs (Home, Search, Bookings, Profile) with active route awareness and auth redirects.
5. **Customer Page Wrapping**: Wrapped customer-facing pages (`HomePage`, `CityPage`, `AuditoriumDetailPage`, `BookingConfirmPage`, `ProfilePage`, `AuthPage`) inside the new `Layout` shell.

---

## Tasks Completed

| Task | Name | Files | Commit |
|------|------|-------|--------|
| 1 | Build Header component and Layout wrapper | `wed-app/src/components/layout/Header.tsx`, `wed-app/src/components/layout/Layout.tsx`, `wed-app/src/components/layout/BottomNav.tsx` (stub), `wed-app/src/components/modals/LocationModal.tsx` (stub) | `c5dd134` |
| 2 | Build LocationModal and mobile BottomNav | `wed-app/src/components/modals/LocationModal.tsx`, `wed-app/src/components/layout/BottomNav.tsx`, `wed-app/src/pages/HomePage.tsx`, `wed-app/src/pages/CityPage.tsx`, `wed-app/src/pages/AuditoriumDetailPage.tsx`, `wed-app/src/pages/BookingConfirmPage.tsx`, `wed-app/src/pages/ProfilePage.tsx`, `wed-app/src/pages/AuthPage.tsx` | `03ae9c3` |

---

## Verification Results

1. **TypeScript compilation**:
   - `npm --prefix wed-app exec tsc -- -p wed-app/tsconfig.app.json --noEmit` passed with 0 errors.
2. **Vite Production Build**:
   - `npm --prefix wed-app run build` succeeded without error (`tsc -b && vite build` generated production bundle).
3. **Truths verified**:
   - Header shows logo, city selector badge, search bar, and auth buttons/avatar dropdown.
   - LocationModal opens upon clicking city badge, queries active cities, updates Zustand store, and closes on selection or Escape.
   - BottomNav is strictly mobile (`md:hidden`) with 4 tabs and active path detection.
   - Customer-facing pages properly wrapped in Layout.

---

## Deviations & In-Scope Fixes

- Fixed type-only imports in `useCities.ts` (`import type { City } from '../lib/types'`) to satisfy TypeScript's `verbatimModuleSyntax: true` setting in `tsconfig.app.json`.
