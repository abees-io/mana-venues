# ROADMAP.md — WedBook Platform

**Last Updated:** 2026-11-02
**Status:** PLANNED

---

## Phase Overview

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Project Scaffold & Supabase Foundation | ⬜ TODO | 3 plans |
| 2 | Customer Interface — Feed & Discovery | ⬜ TODO | 4 plans |
| 3 | Auditorium Detail & Booking Flow | ⬜ TODO | 3 plans |
| 4 | Vendor Dashboard | ⬜ TODO | 2 plans |
| 5 | Admin Dashboard | ⬜ TODO | 2 plans |
| 6 | Mobile (Capacitor) & GSAP Polish | ⬜ TODO | 2 plans |

---

## Phase 1 — Project Scaffold & Supabase Foundation

**Goal:** Runnable Vite+React project with Supabase client, full DB schema SQL, RLS policies, and seed data.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 1.1 | 1 | Vite + React + Tailwind + Dependencies scaffold | ✅ |
| 1.2 | 1 | Supabase schema SQL + RLS migration file | ✅ |
| 1.3 | 2 | Supabase client, auth context, types, routing skeleton | ✅ |

---

## Phase 2 — Customer Interface: Feed & Discovery

**Goal:** Homepage with city selector, auditorium card grid, filters — all reading live from Supabase.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 2.1 | 1 | Global layout: Header + BottomNav + LocationModal | ✅ |
| 2.2 | 1 | Zustand store (city/filters) + Supabase hooks for auditoriums | ✅ |
| 2.3 | 2 | AuditoriumCard component + HomePage feed grid | ✅ |
| 2.4 | 2 | Filter panel (capacity, price, amenities) + CityPage | ✅ |

---

## Phase 3 — Auditorium Detail & Booking Flow

**Goal:** Full detail page with photo gallery, availability calendar, and Razorpay payment modal.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 3.1 | 1 | AuditoriumDetailPage: gallery + specs + map placeholder | ✅ |
| 3.2 | 2 | Availability calendar with dynamic pricing from pricing_slots | ✅ |
| 3.3 | 3 | BookingModal: summary, advance calc, Razorpay checkout + booking write | ✅ |

---

## Phase 4 — Vendor Dashboard

**Goal:** Protected /vendor route with stats, hall management, pricing, and date blocking.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 4.1 | 1 | VendorDashboard: layout, stats cards, bookings list | ✅ |
| 4.2 | 2 | VendorHallManager: edit specs, photo upload, pricing slot editor | ✅ |

---

## Phase 5 — Admin Dashboard

**Goal:** Protected /admin route with platform metrics and verification queue.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 5.1 | 1 | AdminDashboard: metrics panel + commission tracker | ✅ |
| 5.2 | 2 | AdminVerificationQueue: approve/reject auditoriums | ✅ |

---

## Phase 6 — Mobile & Polish

**Goal:** Capacitor config ready for Android build, GSAP animations wired, seed data confirmed.

| Plan | Wave | Name | Auto? |
|------|------|------|-------|
| 6.1 | 1 | Capacitor v6 setup + capacitor.config.ts + Android platform | ✅ |
| 6.2 | 2 | GSAP animations (hero, gallery, card reveal) + seed SQL | ✅ |

---

## Execution Order

```
Phase 1 (Wave 1 → 2) → Phase 2 (Wave 1 → 2) → Phase 3 (Wave 1→2→3) 
→ Phase 4 (Wave 1→2) [parallel with Phase 5] → Phase 5 (Wave 1→2)
→ Phase 6 (Wave 1→2)
```

