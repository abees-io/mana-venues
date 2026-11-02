---
phase: 5
plan: 2
wave: 2
depends_on: [5.1]
files_modified:
  - wed-app/src/pages/admin/AdminVerificationQueue.tsx
  - wed-app/src/components/admin/AuditoriumVerificationCard.tsx
  - wed-app/src/hooks/useVerificationQueue.ts
autonomous: true

must_haves:
  truths:
    - "Verification queue lists all auditoriums where verified = false"
    - "Each card shows: vendor name, venue title, city, capacity, price, photos preview"
    - "Approve button sets verified = true and sends a console.log notification (WhatsApp placeholder)"
    - "Reject button sets verified = false (keeps it off public search) and shows rejection note"
    - "Queue updates in real-time (React Query invalidation after approve/reject)"
  artifacts:
    - "wed-app/src/pages/admin/AdminVerificationQueue.tsx"
    - "wed-app/src/hooks/useVerificationQueue.ts"
---

# Plan 5.2: Admin Verification Queue — Approve/Reject Auditoriums

<objective>
Build the auditorium verification queue where admins review new vendor submissions and approve or reject them.

Purpose: Quality control — only verified auditoriums appear in public search.
Output: AdminVerificationQueue page, AuditoriumVerificationCard, useVerificationQueue hook.
</objective>

<context>
Load for context:
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts
- wed-app/src/lib/utils.ts (formatCurrency)
</context>

<tasks>

<task type="auto">
  <name>Build useVerificationQueue hook and approve/reject mutations</name>
  <files>
    wed-app/src/hooks/useVerificationQueue.ts
  </files>
  <action>
    **`useVerificationQueue.ts`:**

    Query `unverifiedAuditoriums`:
    ```ts
    supabase.from('auditoriums')
      .select('*, cities(name), profiles(full_name, email, phone)')
      .eq('verified', false)
      .order('created_at', { ascending: true })
    ```
    Returns `{ data: AuditoriumWithVendor[], isLoading, error }`.

    Mutation `approveAuditorium(id: string)`:
    ```ts
    supabase.from('auditoriums').update({ verified: true }).eq('id', id)
    ```
    On success:
    1. Invalidate `['verification_queue']` query
    2. Invalidate `['auditoriums']` query (so it appears in public feed)
    3. Log placeholder: `console.log('[WhatsApp Placeholder] Venue approved notification sent to', vendorPhone)`

    Mutation `rejectAuditorium(id: string, reason: string)`:
    ```ts
    // Store rejection in a simple way: update description to include rejection note
    // Or: Add a rejection_notes field (if adding column) — for now just log
    supabase.from('auditoriums').update({ verified: false }).eq('id', id)
    ```
    On success: invalidate query, log WhatsApp placeholder.

    AVOID: Hard-deleting rejected auditoriums — vendors should be able to fix and resubmit.
  </action>
  <verify>
    Insert a new auditorium with verified=false.
    useVerificationQueue returns it.
    Call approveAuditorium(id) → auditorium.verified becomes true → disappears from queue.
  </verify>
  <done>Queue fetches unverified auditoriums. Approve sets verified=true. Reject keeps verified=false. Both invalidate queries.</done>
</task>

<task type="auto">
  <name>Build AdminVerificationQueue page and verification cards</name>
  <files>
    wed-app/src/pages/admin/AdminVerificationQueue.tsx
    wed-app/src/components/admin/AuditoriumVerificationCard.tsx
  </files>
  <action>
    **`AuditoriumVerificationCard.tsx`:**
    Props: `{ auditorium: AuditoriumWithVendor, onApprove, onReject }`

    Card layout:
    ```
    ┌────────────────────────────────────────────────┐
    │ [Photo thumbnail strip (3 photos)]             │
    ├────────────────────────────────────────────────┤
    │ 🏛️ Grand Kochi Palace           📍 Kochi       │
    │ Vendor: Rajesh Kumar  📞 +91 98765 43210        │
    │ Capacity: 1500 seated | Price: ₹1,50,000/day   │
    │ Amenities: AC, Parking, Catering               │
    │ Submitted: 2 hours ago                         │
    ├────────────────────────────────────────────────┤
    │ [📝 View Full Listing]  [❌ Reject] [✅ Approve]│
    └────────────────────────────────────────────────┘
    ```
    "Reject" → opens a small inline form to type rejection reason → confirms reject.
    "Approve" → confirm dialog ("Are you sure? This will make the venue public.") → calls onApprove.
    Loading spinner on approve/reject buttons while mutation runs.
    "View Full Listing" → opens /auditorium/:slug in new tab.

    **`AdminVerificationQueue.tsx`:**
    Layout:
    - Breadcrumb: Admin > Verification Queue
    - Count badge: "N venues pending review"
    - If empty: "🎉 All venues are verified! No pending reviews."
    - Grid of `<AuditoriumVerificationCard>` components (1 col mobile, 2 col desktop)
    - Loading skeleton cards while fetching

    AVOID: Allowing approve/reject without confirmation — show a confirm dialog before mutation.
  </action>
  <verify>
    Navigate to /admin/verification → unverified auditoriums listed.
    Click Approve on one → confirmation dialog → confirm → card disappears from list.
    Check Supabase: auditorium.verified = true.
  </verify>
  <done>Queue renders all unverified auditoriums. Approve/reject mutations work with confirmation. Queue auto-updates after action.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] /admin/verification shows all unverified auditoriums
- [ ] Each card shows vendor name, phone, venue specs, photo thumbnails
- [ ] Approve button sets verified=true and venue appears in public search
- [ ] Reject button keeps verified=false with reason logged
- [ ] Queue shows "All verified" state when empty
- [ ] WhatsApp placeholder log appears in console
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

