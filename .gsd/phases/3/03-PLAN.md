---
phase: 3
plan: 3
wave: 3
depends_on: [3.2]
files_modified:
  - wed-app/src/components/booking/BookingModal.tsx
  - wed-app/src/components/booking/BookingWidget.tsx
  - wed-app/src/hooks/useCreateBooking.ts
autonomous: true
user_setup:
  - service: razorpay
    why: "Payment processing in test mode"
    env_vars:
      - name: VITE_RAZORPAY_KEY_ID
        source: "Razorpay Dashboard (test.razorpay.com) → Settings → API Keys → Key ID"
    dashboard_config:
      - task: "Load Razorpay checkout script"
        location: "Add <script src='https://checkout.razorpay.com/v1/checkout.js'> to index.html"

must_haves:
  truths:
    - "BookingWidget shows selected date, price breakdown, and 'Book Now' button"
    - "BookingModal summarizes booking: venue, date, total, 30% advance"
    - "Razorpay checkout opens with correct amount (advance_paid in paise)"
    - "On payment success: booking row inserted into Supabase with payment_id"
    - "Pricing slot status updated to 'booked' after successful payment"
    - "User redirected to /booking/confirm with booking ID"
  artifacts:
    - "wed-app/src/components/booking/BookingModal.tsx"
    - "wed-app/src/components/booking/BookingWidget.tsx"
    - "wed-app/src/hooks/useCreateBooking.ts"
---

# Plan 3.3: BookingModal — Summary, Razorpay Checkout, Booking Write

<objective>
Build the booking widget (shows on detail page right panel), confirmation modal with price breakdown, and Razorpay test-mode checkout integration that writes a booking to Supabase on success.

Purpose: This is the revenue-generating core of the platform.
Output: BookingWidget, BookingModal, useCreateBooking mutation hook.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (booking flow, advance payment calculation)
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts
- wed-app/src/lib/utils.ts (formatCurrency, calculateAdvance)
- wed-app/src/contexts/AuthContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Build BookingWidget and BookingModal UI components</name>
  <files>
    wed-app/src/components/booking/BookingWidget.tsx
    wed-app/src/components/booking/BookingModal.tsx
  </files>
  <action>
    **`BookingWidget.tsx`:**
    Props: `{ auditorium: Auditorium }`
    State: `selectedDate: Date | null`, `selectedPrice: number`

    Layout (sticky card on desktop right panel):
    ```
    ┌─────────────────────────────┐
    │ 📅 Select a Date            │
    │ [AvailabilityCalendar]      │
    ├─────────────────────────────┤
    │ Selected: 15 Dec 2025       │
    │ Total: ₹1,50,000/day        │
    │ Advance (30%): ₹45,000      │
    ├─────────────────────────────┤
    │ [Book This Date] button     │
    │ (disabled if no date)       │
    └─────────────────────────────┘
    ```
    - AvailabilityCalendar integrated here, `onDateSelect` updates local state.
    - "Book This Date" button: brand-primary, full width.
    - Clicking "Book This Date":
      1. If !user → redirect to /auth/login with returnUrl
      2. Else → open BookingModal
    - Sticky: `sticky top-24` with `max-h-[calc(100vh-6rem)] overflow-y-auto`

    **`BookingModal.tsx`:**
    Props: `{ isOpen, onClose, auditorium, date, totalPrice, advanceAmount, onPaymentSuccess }`

    Layout (centered modal overlay):
    ```
    ┌──────────────────────────────────────┐
    │ 🎊 Confirm Your Booking              │
    ├──────────────────────────────────────┤
    │ Venue: Grand Kochi Palace            │
    │ Date: Saturday, 15 December 2025     │
    │ Total Amount: ₹1,50,000              │
    │ Advance to Pay (30%): ₹45,000        │
    │ Remaining: ₹1,05,000                 │
    │ (Payable on event day to vendor)     │
    ├──────────────────────────────────────┤
    │ [Cancel] [Pay Advance ₹45,000 →]    │
    └──────────────────────────────────────┘
    ```
    "Pay Advance" button triggers Razorpay (Plan below).
    Loading state while payment processes.
    AVOID: Charging full amount — always 30% advance (use `calculateAdvance(totalPrice, 0.30)`).
  </action>
  <verify>Open detail page → select available date → price appears in widget → click Book → modal opens with correct amounts (total and 30% advance).</verify>
  <done>Widget shows selected date and price. Modal shows correct breakdown. Advance = 30% of total.</done>
</task>

<task type="auto">
  <name>Implement Razorpay checkout integration and Supabase booking write</name>
  <files>
    wed-app/src/hooks/useCreateBooking.ts
    wed-app/src/components/booking/BookingModal.tsx
    wed-app/index.html
    wed-app/src/pages/BookingConfirmPage.tsx
  </files>
  <action>
    **`index.html`** — Add before `</body>`:
    ```html
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    ```

    **`useCreateBooking.ts`:**
    React Query `useMutation` hook.
    Mutation function: `createBooking(payload: NewBookingPayload)`
    Steps:
    1. Insert booking into Supabase with `booking_status: 'pending'`
    2. Open Razorpay: 
       ```ts
       const rzp = new (window as any).Razorpay({
         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
         amount: Math.round(advanceAmount * 100),  // paise
         currency: 'INR',
         name: 'WedBook',
         description: `Booking for ${auditoriumTitle}`,
         order_id: undefined,  // Test mode: skip server-side order creation
         prefill: { name: profile.full_name, email: profile.email, contact: profile.phone },
         theme: { color: '#8B1A4A' },
         handler: async (response: { razorpay_payment_id: string }) => {
           // Update booking: payment_id, booking_status: 'confirmed', advance_paid
           await supabase.from('bookings').update({
             payment_id: response.razorpay_payment_id,
             booking_status: 'confirmed',
             advance_paid: advanceAmount
           }).eq('id', bookingId)
           // Update pricing slot to 'booked'
           await supabase.from('pricing_slots').upsert({
             auditorium_id: auditoriumId, date: dateStr, status: 'booked'
           }, { onConflict: 'auditorium_id,date' })
           onSuccess(bookingId)
         },
         modal: { ondismiss: () => { /* Cancel booking if user closes */ } }
       })
       rzp.open()
       ```
    3. On success callback: invalidate queries ['auditoriums', 'pricing_slots']
    4. Navigate to `/booking/confirm?id=${bookingId}`

    **`BookingConfirmPage.tsx`:**
    Reads `id` from URL searchParams.
    Fetches booking + auditorium data.
    Shows success card:
    - ✅ "Booking Confirmed!" 
    - Payment ID, venue, date, advance paid, remaining balance
    - "View All Bookings" button → /profile
    - "Back to Home" button

    NOTE: In Razorpay test mode, no server-side order creation needed.
    Razorpay test card: 4111 1111 1111 1111, CVV: any, expiry: any future date.

    AVOID: Storing Razorpay Secret Key client-side — only Key ID goes in VITE_ env vars.
    AVOID: Skipping the slot status update — without it, double booking is possible.
  </action>
  <verify>
    Select an available date, click Book, modal shows correct amounts.
    Click "Pay Advance" → Razorpay test modal opens.
    Use test card → payment succeeds → booking row in Supabase shows confirmed + payment_id.
    pricing_slots row for that date shows status = 'booked'.
    Redirect to /booking/confirm.
  </verify>
  <done>
    Razorpay opens in test mode. Payment success updates booking status and pricing slot.
    Confirm page shows booking summary.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Booking modal shows correct total and 30% advance calculation
- [ ] Razorpay checkout.js loads without 404
- [ ] Test payment completes successfully
- [ ] Supabase bookings row: booking_status = 'confirmed', payment_id set
- [ ] Supabase pricing_slots row: status = 'booked' for booked date
- [ ] /booking/confirm page shows full booking summary
- [ ] Booked date appears red/unavailable on calendar after booking
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

