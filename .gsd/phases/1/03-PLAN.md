---
phase: 1
plan: 3
wave: 2
depends_on: [1.1, 1.2]
files_modified:
  - wed-app/src/lib/supabase.ts
  - wed-app/src/lib/types.ts
  - wed-app/src/contexts/AuthContext.tsx
  - wed-app/src/App.tsx
  - wed-app/src/router/index.tsx
  - wed-app/src/pages/AuthPage.tsx
  - wed-app/src/components/ProtectedRoute.tsx
autonomous: true

must_haves:
  truths:
    - "Supabase client initializes using VITE_ env vars"
    - "AuthContext provides user, profile, signIn, signUp, signOut"
    - "ProtectedRoute redirects unauthenticated users to /auth/login"
    - "Role-based protection: vendor route rejects non-vendor users"
    - "All TypeScript types match the DB schema exactly"
  artifacts:
    - "wed-app/src/lib/supabase.ts exports typed supabase client"
    - "wed-app/src/lib/types.ts exports Database, Profile, Auditorium, Booking, etc."
    - "wed-app/src/router/index.tsx defines all 10 routes"
---

# Plan 1.3: Supabase Client, Auth Context, Types & Routing Skeleton

<objective>
Wire the Supabase client, TypeScript type definitions matching the DB schema, an AuthContext with session management, and React Router with all route placeholders.

Purpose: Every subsequent phase needs typed Supabase calls and protected routing.
Output: Typed client, AuthContext, all route stubs, ProtectedRoute HOC.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (routes table, tech stack)
- wed-app/src/App.tsx (current placeholder)
</context>

<tasks>

<task type="auto">
  <name>Create Supabase client, TypeScript DB types, and utility lib</name>
  <files>
    wed-app/src/lib/supabase.ts
    wed-app/src/lib/types.ts
    wed-app/src/lib/utils.ts
  </files>
  <action>
    **`src/lib/supabase.ts`:**
    ```ts
    import { createClient } from '@supabase/supabase-js'
    import type { Database } from './types'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Check .env.local')
    }

    export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    ```

    **`src/lib/types.ts`:**
    Define a full TypeScript `Database` interface matching the Supabase schema.
    Export row types: `Profile`, `City`, `Auditorium`, `PricingSlot`, `Booking`.
    Also export insert/update variants: `NewBooking`, `NewAuditorium`, etc.

    Key typings:
    - `Auditorium.photos`: `string[]`
    - `Auditorium.amenities`: `string[]`
    - `Profile.role`: `'customer' | 'vendor' | 'admin'`
    - `PricingSlot.status`: `'available' | 'booked' | 'blocked'`
    - `Booking.booking_status`: `'pending' | 'confirmed' | 'cancelled'`

    **`src/lib/utils.ts`:**
    Export helpers:
    - `cn(...classes)` — clsx + tailwind-merge combo
    - `formatCurrency(amount: number)` → `"₹1,25,000"` (Indian formatting using Intl.NumberFormat with locale 'en-IN')
    - `formatDate(dateStr: string)` → `"15 Dec 2025"` (date-fns format)
    - `calculateAdvance(total: number, pct = 0.30)` → number

    AVOID: Using `any` type anywhere — use `unknown` and narrow.
  </action>
  <verify>npx tsc --noEmit (from wed-app dir) — 0 errors</verify>
  <done>Supabase client typed, all DB row types exported, utility functions exported</done>
</task>

<task type="auto">
  <name>Build AuthContext, ProtectedRoute, and full React Router skeleton</name>
  <files>
    wed-app/src/contexts/AuthContext.tsx
    wed-app/src/components/ProtectedRoute.tsx
    wed-app/src/router/index.tsx
    wed-app/src/App.tsx
    wed-app/src/pages/AuthPage.tsx
    wed-app/src/pages/HomePage.tsx
    wed-app/src/pages/CityPage.tsx
    wed-app/src/pages/AuditoriumDetailPage.tsx
    wed-app/src/pages/BookingConfirmPage.tsx
    wed-app/src/pages/ProfilePage.tsx
    wed-app/src/pages/vendor/VendorDashboard.tsx
    wed-app/src/pages/vendor/VendorHallManager.tsx
    wed-app/src/pages/admin/AdminDashboard.tsx
    wed-app/src/pages/admin/AdminVerificationQueue.tsx
  </files>
  <action>
    **`src/contexts/AuthContext.tsx`:**
    - React context providing: `{ user, profile, loading, signIn, signUp, signOut }`
    - On mount: `supabase.auth.getSession()` + subscribe to `onAuthStateChange`
    - After session set: fetch `profiles` row by `user.id` to get `role`
    - `signIn(email, password)` → `supabase.auth.signInWithPassword()`
    - `signUp(email, password, fullName, phone)` → `supabase.auth.signUp()` with metadata
    - `signOut()` → `supabase.auth.signOut()`
    - Export `useAuth()` hook that throws if used outside provider

    **`src/components/ProtectedRoute.tsx`:**
    Props: `{ requiredRole?: 'customer' | 'vendor' | 'admin', children: ReactNode }`
    - If loading: show spinner
    - If !user: `<Navigate to="/auth/login" replace />`
    - If requiredRole and profile.role !== requiredRole AND profile.role !== 'admin': `<Navigate to="/" replace />`
    - Else: render children

    **`src/router/index.tsx`:**
    Use `createBrowserRouter` with all 10 routes from SPEC.md.
    Wrap vendor and admin routes with `<ProtectedRoute requiredRole="vendor">` etc.

    **Page stubs:** Each page file exports a component returning a div with the page name
    (e.g., `<div>HomePage — TODO</div>`). These get filled in later phases.

    **`src/App.tsx`:**
    Wrap with `<AuthProvider>`, `<QueryClientProvider>`, `<RouterProvider router={router}>`.

    AVOID: Fetching profile in every component — use AuthContext as single source of truth.
    AVOID: Storing JWT manually — Supabase handles session persistence.
  </action>
  <verify>
    npm run dev → navigate to /vendor → redirects to /auth/login.
    Login with test user → /vendor shows VendorDashboard stub.
  </verify>
  <done>
    Auth flow works end-to-end. Protected routes enforce role. All 10 route stubs render.
    TypeScript compiles clean.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `npx tsc --noEmit` exits 0 from wed-app
- [ ] Visiting /vendor without login → redirects to /auth/login
- [ ] Visiting /admin with vendor account → redirects to /
- [ ] `formatCurrency(125000)` returns `"₹1,25,000"`
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

