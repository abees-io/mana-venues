---
phase: 3
plan: 2
wave: 2
depends_on: [3.1]
files_modified:
  - wed-app/src/components/booking/AvailabilityCalendar.tsx
  - wed-app/src/hooks/usePricingSlots.ts
autonomous: true

must_haves:
  truths:
    - "Calendar shows current month and next month navigation"
    - "Each date cell shows: available (green), booked (red/strikethrough), blocked (gray), or custom price"
    - "Clicking an available date selects it and shows the price"
    - "Past dates are disabled and grayed out"
    - "Custom price from pricing_slots overrides base_price_per_day for that date"
  artifacts:
    - "wed-app/src/components/booking/AvailabilityCalendar.tsx"
---

# Plan 3.2: Availability Calendar with Dynamic Pricing

<objective>
Build the date-picker availability calendar that fetches pricing_slots for the auditorium and renders each date with its status and price.

Purpose: Users must see which dates are free and at what price before committing.
Output: AvailabilityCalendar component integrated into AuditoriumDetailPage.
</objective>

<context>
Load for context:
- wed-app/src/hooks/usePricingSlots.ts
- wed-app/src/lib/types.ts (PricingSlot type)
- wed-app/src/lib/utils.ts (formatCurrency, formatDate)
</context>

<tasks>

<task type="auto">
  <name>Build AvailabilityCalendar with pricing overlay</name>
  <files>
    wed-app/src/components/booking/AvailabilityCalendar.tsx
  </files>
  <action>
    **`AvailabilityCalendar.tsx`:**
    Props:
    ```ts
    {
      auditoriumId: string
      basePricePerDay: number
      onDateSelect: (date: Date, price: number) => void
      selectedDate?: Date
    }
    ```

    State:
    - `currentMonth: Date` (default: start of current month)
    - Derived: all days in the month as array of Date objects

    Data: `usePricingSlots(auditoriumId, startOfMonth(currentMonth), endOfMonth(currentMonth))`
    Build a Map: `dateString → PricingSlot` for O(1) lookups.

    Calendar grid layout:
    ```
    ← [November 2025] →        (prev/next month arrows)
    
    Su  Mo  Tu  We  Th  Fr  Sa
    [1] [2] [3] ...
    ```

    Cell rendering logic per day:
    - Past date: `opacity-40 cursor-not-allowed bg-gray-100`
    - status === 'booked': `bg-red-50 text-red-400 line-through cursor-not-allowed`
    - status === 'blocked': `bg-gray-200 text-gray-400 cursor-not-allowed`
    - status === 'available' with custom_price: `bg-green-50 hover:bg-brand-primary hover:text-white cursor-pointer`
      Show formatted price below date number (small font)
    - No slot (defaults to available): same as above, show base price
    - selectedDate matches: `bg-brand-primary text-white ring-2 ring-brand-secondary`

    Month navigation: clicking ← goes to previous month (min: current month), → goes to next month (max: 12 months ahead).
    After month change: new `usePricingSlots` query fires automatically (key changes).

    Price display in cell: only show if cell is small enough — use abbreviated format:
    `formatCurrency(price).replace('₹','').replace(',','' )` → "75k" or use k-formatting.
    Helper: `toShortPrice(n: number)` → "₹75K", "₹1.5L"

    On date click (available only): call `onDateSelect(date, price)`.

    AVOID: Building a full calendar from scratch with complex date math — use date-fns helpers:
    `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `isBefore`, `isSameDay`, `format`, `getDay`
    AVOID: Fetching 12 months at once — fetch one month at a time, use React Query caching.
  </action>
  <verify>
    Render calendar for an auditorium with 3 booked slots. Those 3 dates show red strikethrough.
    Available dates show green with price. Past dates disabled. Next month button loads new pricing.
    Click available date → onDateSelect fires with correct date and price.
  </verify>
  <done>
    Calendar renders 1 month at a time. Status colors correct. Custom prices override base price.
    Date selection fires callback. Past/booked dates unclickable.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Calendar renders correct days for current month (incl. correct day-of-week offset)
- [ ] Booked dates show red strikethrough and are unclickable
- [ ] Blocked dates show gray and are unclickable
- [ ] Available dates show price in cell
- [ ] Clicking available date calls onDateSelect with correct Date and price
- [ ] Month navigation fires new Supabase query
- [ ] Past dates are disabled
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

