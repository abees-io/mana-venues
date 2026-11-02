# SPEC.md — Wedding Auditorium Booking Platform

**Status: FINALIZED**
**Version:** 1.0
**Created:** 2026-11-02
**Project Dir:** `c:\Users\ABHI\OneDrive\Documents\WEDS\wed-app`

---

## Product Overview

A production-grade **Wedding Auditorium Booking Web & Mobile Application** — a BookMyShow-style platform for discovering, browsing, and booking wedding halls across Kerala cities (Kochi, Trivandrum, Kozhikode). Three user roles (customer, vendor, admin) each get a tailored experience within one unified codebase.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Styling | Tailwind CSS v3 + shadcn/ui primitives |
| Icons | Lucide React |
| Animations | GSAP (ScrollTrigger, Timeline) |
| State | Zustand (global store) + React Query (server state) |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS + Storage) |
| Payments | Razorpay (Test Mode) |
| Mobile | Capacitor v6 (Android target) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |

---

## Database Schema

### Table: `profiles`
- `id` UUID PK → references `auth.users(id)`
- `full_name` TEXT NOT NULL
- `email` TEXT NOT NULL UNIQUE
- `phone` TEXT
- `role` TEXT CHECK IN ('customer','vendor','admin') DEFAULT 'customer'
- `avatar_url` TEXT
- `created_at` TIMESTAMPTZ DEFAULT now()

### Table: `cities`
- `id` UUID PK DEFAULT gen_random_uuid()
- `name` TEXT NOT NULL
- `slug` TEXT NOT NULL UNIQUE
- `state` TEXT NOT NULL DEFAULT 'Kerala'
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMPTZ DEFAULT now()

### Table: `auditoriums`
- `id` UUID PK DEFAULT gen_random_uuid()
- `owner_id` UUID → references `profiles(id)`
- `city_id` UUID → references `cities(id)`
- `title` TEXT NOT NULL
- `slug` TEXT NOT NULL UNIQUE
- `address` TEXT
- `latitude` NUMERIC(10,7)
- `longitude` NUMERIC(10,7)
- `seating_capacity` INT NOT NULL
- `floating_capacity` INT DEFAULT 0
- `base_price_per_day` NUMERIC(12,2) NOT NULL
- `photos` JSONB DEFAULT '[]'
- `description` TEXT
- `amenities` JSONB DEFAULT '[]'   -- e.g. ["AC","Parking","Catering","Stage Decor","Generator"]
- `verified` BOOLEAN DEFAULT false
- `created_at` TIMESTAMPTZ DEFAULT now()

### Table: `pricing_slots`
- `id` UUID PK DEFAULT gen_random_uuid()
- `auditorium_id` UUID → references `auditoriums(id)` ON DELETE CASCADE
- `date` DATE NOT NULL
- `custom_price` NUMERIC(12,2)
- `status` TEXT CHECK IN ('available','booked','blocked') DEFAULT 'available'
- UNIQUE(auditorium_id, date)

### Table: `bookings`
- `id` UUID PK DEFAULT gen_random_uuid()
- `customer_id` UUID → references `profiles(id)`
- `auditorium_id` UUID → references `auditoriums(id)`
- `date` DATE NOT NULL
- `total_amount` NUMERIC(12,2) NOT NULL
- `advance_paid` NUMERIC(12,2) DEFAULT 0
- `booking_status` TEXT CHECK IN ('pending','confirmed','cancelled') DEFAULT 'pending'
- `payment_id` TEXT   -- Razorpay order/payment ID
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT now()

---

## Row-Level Security Policies

| Table | Who | Access |
|-------|-----|--------|
| `cities` | Anyone | SELECT (is_active = true) |
| `auditoriums` | Anyone | SELECT (verified = true) |
| `auditoriums` | Vendor (owner) | SELECT + UPDATE own rows |
| `auditoriums` | Admin | Full CRUD |
| `pricing_slots` | Anyone | SELECT |
| `pricing_slots` | Vendor (owner via join) | INSERT + UPDATE + DELETE own |
| `pricing_slots` | Admin | Full CRUD |
| `profiles` | Owner | SELECT + UPDATE own row |
| `profiles` | Admin | Full CRUD |
| `bookings` | Customer (owner) | SELECT + INSERT own rows |
| `bookings` | Vendor | SELECT bookings for their auditoriums |
| `bookings` | Admin | Full CRUD |

---

## Application Routes

| Path | Component | Auth Required | Role |
|------|-----------|--------------|------|
| `/` | `HomePage` | No | Customer |
| `/city/:slug` | `CityPage` | No | Customer |
| `/auditorium/:slug` | `AuditoriumDetailPage` | No | Customer |
| `/booking/confirm` | `BookingConfirmPage` | Yes | Customer |
| `/profile` | `ProfilePage` | Yes | Customer |
| `/vendor` | `VendorDashboard` | Yes | Vendor |
| `/vendor/auditorium/:id` | `VendorHallManager` | Yes | Vendor |
| `/admin` | `AdminDashboard` | Yes | Admin |
| `/admin/verification` | `AdminVerificationQueue` | Yes | Admin |
| `/auth/login` | `AuthPage` | No | — |
| `/auth/register` | `AuthPage` | No | — |

---

## Feature Modules

### Customer Interface
1. **Header** — Logo, city selector modal (updates global city state), search bar, auth menu
2. **Feed** — Auditorium cards grid; filters: capacity range, price range slider, amenity checkboxes
3. **Detail Page** — Photo gallery carousel (GSAP), specs grid, map placeholder, availability calendar
4. **Booking Modal** — Date pricing summary, 30% advance calculator, Razorpay checkout trigger

### Vendor Dashboard
1. Stats: total inquiries, upcoming bookings, revenue (from `bookings` aggregation)
2. Hall Manager: edit specs, upload to Supabase Storage, update pricing slots, block dates

### Admin Dashboard
1. Platform metrics: total bookings, commission tracking (10% of total_amount), vendor payouts
2. Verification Queue: list of `verified = false` auditoriums with approve/reject actions

---

## Mobile / Capacitor Config
- Capacitor v6 configured in `wed-app/capacitor.config.ts`
- `appId`: `com.wedapp.booking`
- `appName`: `WedBook`
- Sticky bottom nav for mobile (hidden on desktop via Tailwind breakpoints)
- Android SDK target: API 34

---

## Seed Data

### Cities
| Name | Slug | State |
|------|------|-------|
| Kochi | kochi | Kerala |
| Trivandrum | trivandrum | Kerala |
| Kozhikode | kozhikode | Kerala |

### Auditoriums (6 total — 2 per city)
Each with realistic prices (₹75,000–₹2,50,000/day), 4 photo URLs (Unsplash), amenities, and verified=true.

---

## Environment Variables Required

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RAZORPAY_KEY_ID=
```

---

## Non-Goals (v1)
- No native push notifications (placeholder only)
- No WhatsApp/SMS API (placeholder hook only)
- No multi-day booking spans
- No vendor payout automation

