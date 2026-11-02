---
phase: 5
plan: 1
wave: 1
depends_on: [3.3]
files_modified:
  - wed-app/src/pages/admin/AdminDashboard.tsx
  - wed-app/src/components/admin/PlatformMetricsPanel.tsx
  - wed-app/src/hooks/useAdminMetrics.ts
autonomous: true

must_haves:
  truths:
    - "Route /admin protected — only 'admin' role can access"
    - "Metrics panel shows: total bookings, total revenue, platform commission (10%), vendor payouts"
    - "Commission = SUM(advance_paid) * 0.10 across all confirmed bookings"
    - "Breakdown by city (bookings and revenue per city)"
  artifacts:
    - "wed-app/src/pages/admin/AdminDashboard.tsx"
    - "wed-app/src/hooks/useAdminMetrics.ts"
---

# Plan 5.1: Admin Dashboard — Platform Metrics Panel

<objective>
Build the admin-protected dashboard with platform-wide metrics: total bookings, total revenue, commission tracking, and per-city breakdowns.

Purpose: Platform admins need financial and operational overview.
Output: AdminDashboard page, PlatformMetricsPanel, useAdminMetrics hook.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (admin dashboard section)
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts (Booking type)
</context>

<tasks>

<task type="auto">
  <name>Build useAdminMetrics hook with aggregation queries</name>
  <files>
    wed-app/src/hooks/useAdminMetrics.ts
  </files>
  <action>
    **`useAdminMetrics.ts`:**
    Query key: `['admin_metrics']`
    Requires admin role (ProtectedRoute handles this, but also verify `profile.role === 'admin'`).

    Queries (parallel Promise.all):
    1. **Total bookings by status:**
       ```ts
       supabase.from('bookings').select('booking_status')
       // Count per status client-side
       ```
    2. **Revenue aggregation:**
       ```ts
       supabase.from('bookings')
         .select('advance_paid, booking_status')
         .eq('booking_status', 'confirmed')
       // Sum advance_paid for totalRevenue
       // platformCommission = totalRevenue * 0.10
       // vendorPayouts = totalRevenue * 0.90
       ```
    3. **Bookings per city:**
       ```ts
       supabase.from('bookings')
         .select('auditorium_id, auditoriums(city_id, cities(name))')
       // Group by city name client-side
       ```
    4. **Recent bookings (last 10):**
       ```ts
       supabase.from('bookings')
         .select('*, profiles(full_name), auditoriums(title, cities(name))')
         .order('created_at', { ascending: false })
         .limit(10)
       ```

    Returns:
    ```ts
    {
      totalBookings: number
      confirmedBookings: number
      pendingBookings: number
      cancelledBookings: number
      totalRevenue: number
      platformCommission: number
      vendorPayouts: number
      bookingsByCity: { city: string, count: number, revenue: number }[]
      recentBookings: BookingWithDetails[]
    }
    ```

    AVOID: Fetching full booking objects for counts — use `{ count: 'exact', head: true }` for count-only queries.
  </action>
  <verify>
    With seed bookings: hook returns non-zero totalRevenue. Commission = totalRevenue * 0.10. bookingsByCity has 3 entries (Kochi, Trivandrum, Kozhikode).
  </verify>
  <done>All metrics computed. Commission and payout calculations correct. City breakdown populated.</done>
</task>

<task type="auto">
  <name>Build AdminDashboard page and PlatformMetricsPanel</name>
  <files>
    wed-app/src/pages/admin/AdminDashboard.tsx
    wed-app/src/components/admin/PlatformMetricsPanel.tsx
  </files>
  <action>
    **`PlatformMetricsPanel.tsx`:**
    Props: `{ metrics: AdminMetrics }`

    Row 1 — Big stat cards (4 cards):
    - 📊 Total Bookings
    - ✅ Confirmed
    - ⏳ Pending
    - ❌ Cancelled

    Row 2 — Financial cards (3 cards):
    - 💰 Total Revenue (advance paid): formatted with formatCurrency
    - 🏛️ Platform Commission (10%): brand-secondary color
    - 🤝 Vendor Payouts (90%): green

    Row 3 — City table:
    | City | Bookings | Revenue |
    |------|----------|---------|
    | Kochi | 12 | ₹4,50,000 |

    Row 4 — Recent Bookings table (last 10):
    Customer | Venue | City | Date | Amount | Status

    **`AdminDashboard.tsx`:**
    Layout with left sidebar nav:
    - Dashboard (active)
    - Verification Queue → /admin/verification
    - All Bookings (placeholder)
    - Vendors (placeholder)
    - Cities (placeholder)
    - Settings (placeholder)

    Main content: `<PlatformMetricsPanel metrics={...} />`
    Refresh button (ArrowRefreshCw icon) → invalidates admin_metrics query.

    AVOID: Showing financial data to non-admin users — ProtectedRoute with requiredRole="admin" on the route.
  </action>
  <verify>Login as admin → /admin → all metric cards show. Commission = 10% of revenue. City breakdown table has 3 rows. Recent bookings table populated.</verify>
  <done>Admin dashboard renders all metric sections. Financial calculations correct. Sidebar navigation present.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Visiting /admin as vendor → redirected to /
- [ ] All 4 booking status counts accurate
- [ ] Commission exactly 10% of totalRevenue
- [ ] City breakdown table shows all 3 cities
- [ ] Recent bookings table shows customer name, venue, date
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

