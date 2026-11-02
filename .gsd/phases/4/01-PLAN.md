---
phase: 4
plan: 1
wave: 1
depends_on: [3.3]
files_modified:
  - wed-app/src/pages/vendor/VendorDashboard.tsx
  - wed-app/src/components/vendor/VendorStatsCard.tsx
  - wed-app/src/components/vendor/VendorBookingsList.tsx
  - wed-app/src/hooks/useVendorStats.ts
  - wed-app/src/hooks/useVendorBookings.ts
autonomous: true

must_haves:
  truths:
    - "Route /vendor protected — only 'vendor' or 'admin' roles can access"
    - "Stats cards show: total inquiries (pending bookings), upcoming bookings count, total revenue"
    - "Bookings list shows upcoming bookings for vendor's auditoriums with customer name, date, amount"
    - "Revenue calculated from SUM of advance_paid for confirmed bookings"
  artifacts:
    - "wed-app/src/pages/vendor/VendorDashboard.tsx"
    - "wed-app/src/hooks/useVendorStats.ts"
---

# Plan 4.1: Vendor Dashboard — Stats Overview & Bookings

<objective>
Build the vendor-protected dashboard with stats overview (inquiries, bookings, revenue) and an upcoming bookings list reading from Supabase.

Purpose: Vendors need a central view to manage their business.
Output: VendorDashboard page, stats cards, bookings list, and 2 Supabase hooks.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (vendor dashboard section)
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts
- wed-app/src/contexts/AuthContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Build vendor data hooks (stats + bookings)</name>
  <files>
    wed-app/src/hooks/useVendorStats.ts
    wed-app/src/hooks/useVendorBookings.ts
  </files>
  <action>
    **`useVendorStats.ts`:**
    Args: `vendorId: string`
    Query key: `['vendor_stats', vendorId]`

    Three sub-queries (run in parallel with Promise.all):
    1. **Inquiries (pending bookings):**
       ```ts
       supabase.from('bookings')
         .select('id', { count: 'exact' })
         .eq('booking_status', 'pending')
         .in('auditorium_id', auditoriumIds)
       ```
    2. **Upcoming confirmed bookings:**
       ```ts
       supabase.from('bookings')
         .select('id', { count: 'exact' })
         .eq('booking_status', 'confirmed')
         .gte('date', new Date().toISOString().split('T')[0])
         .in('auditorium_id', auditoriumIds)
       ```
    3. **Total revenue (advance paid):**
       ```ts
       supabase.from('bookings')
         .select('advance_paid')
         .eq('booking_status', 'confirmed')
         .in('auditorium_id', auditoriumIds)
       // Sum advance_paid client-side
       ```

    First, fetch vendor's auditorium IDs:
    `supabase.from('auditoriums').select('id').eq('owner_id', vendorId)`

    Returns: `{ inquiries: number, upcomingBookings: number, totalRevenue: number, isLoading }`

    **`useVendorBookings.ts`:**
    Args: `vendorId: string`
    Fetches upcoming confirmed bookings with customer and auditorium data:
    ```ts
    supabase.from('bookings')
      .select('*, auditoriums(title, city_id), profiles(full_name, phone, email)')
      .eq('booking_status', 'confirmed')
      .gte('date', today)
      .in('auditorium_id', auditoriumIds)
      .order('date', { ascending: true })
      .limit(20)
    ```
    Returns typed array of bookings with joined data.

    AVOID: Using a single mega-query — keep stats and bookings list separate for cache granularity.
  </action>
  <verify>
    With seed bookings in DB: useVendorStats returns non-zero counts.
    useVendorBookings returns array with customer names.
  </verify>
  <done>Both hooks return typed data. useVendorStats aggregates all 3 stats. useVendorBookings joins customer + auditorium data.</done>
</task>

<task type="auto">
  <name>Build VendorDashboard page with stats and bookings list</name>
  <files>
    wed-app/src/pages/vendor/VendorDashboard.tsx
    wed-app/src/components/vendor/VendorStatsCard.tsx
    wed-app/src/components/vendor/VendorBookingsList.tsx
  </files>
  <action>
    **`VendorStatsCard.tsx`:**
    Props: `{ icon: LucideIcon, label: string, value: string | number, trend?: string, color: string }`
    Card with icon, big number, label, optional trend indicator.
    Colors: inquiries → blue, bookings → green, revenue → brand-primary.

    **`VendorBookingsList.tsx`:**
    Props: `{ bookings: VendorBooking[] }`
    Table layout (scrollable on mobile):
    | Date | Venue | Customer | Phone | Amount | Status Badge |
    Each row has contact icon (WhatsApp placeholder — `Phone` icon, disabled).
    Status badge: pending → yellow, confirmed → green, cancelled → red.
    Empty state: "No upcoming bookings" with Calendar icon.

    **`VendorDashboard.tsx`:**
    Layout:
    ```
    ┌─────────────────────────────────────────┐
    │ "Welcome back, [Name]" + date           │
    ├──────────┬──────────┬───────────────────┤
    │ Inquiries│ Upcoming │ Total Revenue     │
    │ [N]      │ [N]      │ ₹X,XX,XXX        │
    ├─────────────────────────────────────────┤
    │ Quick Links: [Manage Hall] [Block Dates]│
    ├─────────────────────────────────────────┤
    │ Upcoming Bookings List                  │
    └─────────────────────────────────────────┘
    ```
    Sidebar nav (desktop): Dashboard, Manage Hall, Pricing, Blocked Dates, Settings.
    Mobile: use BottomNav tabs specific to vendor (Dashboard, Hall, Dates, Profile).

    "Manage Hall" button → `/vendor/auditorium/${vendorAuditoriumId}` (if vendor has one).
    "View All Bookings" toggle shows past bookings too.

    AVOID: Hardcoding vendor ID — always use `useAuth().profile.id`.
  </action>
  <verify>Login as vendor → /vendor → stats cards show correct counts. Bookings list shows upcoming bookings. "Manage Hall" button navigates to hall manager.</verify>
  <done>VendorDashboard renders all 3 stats, bookings table, and navigation shortcuts.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Non-vendor user visiting /vendor gets redirected to /
- [ ] Stats cards show correct totals from DB
- [ ] Upcoming bookings list shows customer name, date, amount, status badge
- [ ] "Manage Hall" button links to vendor's auditorium
- [ ] Revenue calculation sums advance_paid of confirmed bookings only
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

