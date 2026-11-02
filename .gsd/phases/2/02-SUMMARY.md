# Plan 2.2 Summary: Zustand Stores + Supabase Data Hooks

## Objective
Build global Zustand stores (city selection with persistence, filter state) and React Query data hooks for fetching auditoriums, cities, auditorium details, and pricing slots from Supabase.

## Tasks Completed

| Task | Name | Files Touched | Commit |
|------|------|---------------|--------|
| 1 | Create Zustand stores for city and filter state | `wed-app/src/store/cityStore.ts`<br>`wed-app/src/store/filterStore.ts` | `f31a4c4` |
| 2 | Build React Query hooks for auditoriums, cities, detail, pricing slots | `wed-app/src/hooks/useAuditoriums.ts`<br>`wed-app/src/hooks/useCities.ts`<br>`wed-app/src/hooks/useAuditoriumDetail.ts`<br>`wed-app/src/hooks/usePricingSlots.ts` | `ca64075` |

## Key Decisions & Implementation Details

- **City Store (`src/store/cityStore.ts`)**: Uses Zustand `persist` middleware storing `selectedCity: { id, name, slug } | null` under the localStorage key `wedbook_city`. Exports `useCityStore`.
- **Filter Store (`src/store/filterStore.ts`)**: In-memory Zustand store for discovery filtering (`capacityMin`, `capacityMax`, `priceMin`, `priceMax`, `amenities`), with actions to update capacity, price, toggle amenities, and reset to defaults.
- **Data Hooks**:
  - `useAuditoriums(citySlug?, filters?)`: React Query hook with cache key `['auditoriums', citySlug, filters]` and 5-minute staleTime. Filters by verified status, city slug, capacity, price, and jsonb amenities contains.
  - `useCities()`: React Query hook with cache key `['cities']` and `staleTime: Infinity` returning active cities sorted by name.
  - `useAuditoriumDetail(slug)`: React Query hook with key `['auditorium', slug]` fetching single auditorium with city and profile relationships.
  - `usePricingSlots(auditoriumId, monthStart, monthEnd)`: React Query hook formatted by month start for caching calendar pricing slots.
- **TypeScript strictness**: Used `import type` imports to adhere to `verbatimModuleSyntax` configured in `tsconfig.app.json`.

## Verification Evidence
- TypeScript validation: `npm --prefix wed-app exec tsc -- -p wed-app/tsconfig.app.json --noEmit` exited 0 with 0 errors.
- Build validation: `npm --prefix wed-app run build` succeeded (`tsc -b && vite build` built in 509ms).
