---
phase: 4
plan: 2
wave: 2
depends_on: [4.1]
files_modified:
  - wed-app/src/pages/vendor/VendorHallManager.tsx
  - wed-app/src/components/vendor/PhotoUploader.tsx
  - wed-app/src/components/vendor/PricingSlotEditor.tsx
  - wed-app/src/components/vendor/DateBlocker.tsx
  - wed-app/src/hooks/useUpdateAuditorium.ts
  - wed-app/src/hooks/useManagePricingSlots.ts
autonomous: true
user_setup:
  - service: supabase-storage
    why: "Photo uploads for auditorium gallery"
    dashboard_config:
      - task: "Create storage bucket named 'auditorium-photos' with public read access"
        location: "Supabase Dashboard → Storage → New Bucket → Name: auditorium-photos → Public: true"

must_haves:
  truths:
    - "Vendor can edit auditorium title, description, address, capacities, base price"
    - "Photo uploader accepts multiple images, uploads to Supabase Storage bucket 'auditorium-photos'"
    - "Photo URLs saved to auditorium.photos JSONB array"
    - "Pricing slot editor allows setting custom price per date (overrides base price)"
    - "Date blocker UI lets vendor mark specific dates as 'blocked'"
  artifacts:
    - "wed-app/src/pages/vendor/VendorHallManager.tsx"
    - "wed-app/src/components/vendor/PhotoUploader.tsx"
---

# Plan 4.2: VendorHallManager — Edit Specs, Photo Upload, Pricing, Date Blocking

<objective>
Build the hall management interface where vendors edit their auditorium details, upload photos to Supabase Storage, set custom pricing per date, and block out dates.

Purpose: Vendors control their listing quality and calendar availability.
Output: VendorHallManager page, PhotoUploader, PricingSlotEditor, DateBlocker.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (vendor dashboard module)
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts
- wed-app/src/hooks/useAuditoriumDetail.ts
</context>

<tasks>

<task type="auto">
  <name>Build PhotoUploader and useUpdateAuditorium mutation</name>
  <files>
    wed-app/src/components/vendor/PhotoUploader.tsx
    wed-app/src/hooks/useUpdateAuditorium.ts
  </files>
  <action>
    **`useUpdateAuditorium.ts`:**
    useMutation hook:
    - `updateSpecs(data: Partial<Auditorium>)` → `supabase.from('auditoriums').update(data).eq('id', auditoriumId)`
    - `addPhoto(url: string)` → append to `auditorium.photos` array using `.update({ photos: [...existing, url] })`
    - `removePhoto(url: string)` → filter out from array
    On success: invalidate `['auditorium', slug]` query.

    **`PhotoUploader.tsx`:**
    Props: `{ auditoriumId: string, existingPhotos: string[], onUpdate: (urls: string[]) => void }`

    Drag-and-drop area (plus click-to-select):
    - Accept: image/jpeg, image/png, image/webp. Max size: 5MB per file.
    - On file select: show preview thumbnails with remove (X) button.
    - Upload button: for each file, upload to Supabase Storage:
      ```ts
      const filePath = `${auditoriumId}/${Date.now()}-${file.name}`
      const { data } = await supabase.storage
        .from('auditorium-photos')
        .upload(filePath, file, { upsert: true })
      const { data: urlData } = supabase.storage
        .from('auditorium-photos')
        .getPublicUrl(filePath)
      // Append urlData.publicUrl to auditorium.photos
      ```
    - Progress bar per file.
    - Existing photos shown in grid with remove button.
    - Max 10 photos total. Show count badge.

    AVOID: Uploading without extension check — validate MIME type before upload.
    AVOID: Using File.name directly as storage path — prefix with auditoriumId and timestamp to avoid collisions.
  </action>
  <verify>
    In VendorHallManager: drag 2 photos into uploader → upload → photos appear in DB photos array → public URL accessible in browser.
  </verify>
  <done>Photos upload to Supabase Storage. Public URLs saved to auditorium.photos JSONB. Existing photos shown with remove option.</done>
</task>

<task type="auto">
  <name>Build VendorHallManager page with spec editor, pricing editor, date blocker</name>
  <files>
    wed-app/src/pages/vendor/VendorHallManager.tsx
    wed-app/src/components/vendor/PricingSlotEditor.tsx
    wed-app/src/components/vendor/DateBlocker.tsx
    wed-app/src/hooks/useManagePricingSlots.ts
  </files>
  <action>
    **`useManagePricingSlots.ts`:**
    - `upsertSlot(date, customPrice, status)` → `supabase.from('pricing_slots').upsert(...)` with `onConflict: 'auditorium_id,date'`
    - `deleteSlot(id)` → delete row
    On success: invalidate `['pricing_slots', auditoriumId]`.

    **`PricingSlotEditor.tsx`:**
    Mini calendar (same base as AvailabilityCalendar, but editable).
    Clicking a date opens an inline popover:
    - Input: "Custom price for [date]" (pre-filled with current custom_price or base_price)
    - Save → upsertSlot(date, price, 'available')
    - Mark as blocked → upsertSlot(date, null, 'blocked')
    - Reset to base price → deleteSlot(slotId) if exists
    Shows current month's slots with status colors.

    **`DateBlocker.tsx`:**
    Simplified UI for batch blocking:
    - Date range picker: select start + end date
    - "Block these dates" button → loop and upsertSlot for each day in range with status='blocked'
    - "Unblock dates" toggle
    List of currently blocked date ranges.

    **`VendorHallManager.tsx`:**
    Tabs layout (tabs at top: "Basic Info", "Photos", "Pricing", "Block Dates"):

    Tab 1 — Basic Info (React Hook Form + Zod):
    Fields: title, description, address, seating_capacity, floating_capacity, base_price_per_day.
    Amenities: checkbox group for the 5 amenities.
    Save → useUpdateAuditorium.updateSpecs()

    Tab 2 — Photos: `<PhotoUploader />`

    Tab 3 — Pricing: `<PricingSlotEditor />`

    Tab 4 — Block Dates: `<DateBlocker />`

    AVOID: Using uncontrolled form inputs — use React Hook Form with Zod schema validation.
    AVOID: Letting non-owners access this page — verify owner_id === user.id before rendering.
  </action>
  <verify>
    Edit title → save → DB updated → detail page shows new title.
    Upload photo → appears in gallery.
    Set custom price for tomorrow → calendar shows custom price.
    Block a date range → calendar shows those dates as blocked.
  </verify>
  <done>All 4 tabs functional. Spec edits persist to DB. Photos upload. Custom pricing saves. Date blocking works.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Editing auditorium title and saving updates the DB record
- [ ] Photo upload succeeds and public URL added to photos array
- [ ] Custom price for a specific date visible in customer calendar
- [ ] Blocking a date makes it unclikable for customers
- [ ] Non-owner cannot access /vendor/auditorium/:id (RLS blocks the update)
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>

