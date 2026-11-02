# Plan 1.2 Summary: Supabase Database Schema + RLS Migration

**Plan:** `02-PLAN.md`
**Phase:** 1
**Status:** Complete

## Objective
Write the complete, runnable SQL migration file creating all 5 core tables with constraints, indexes, helper functions, and idempotent Row-Level Security policies.

## Deliverables
- `wed-app/supabase/migrations/001_initial_schema.sql` (258 lines)

## Components Defined
1. **Extensions**: `uuid-ossp`
2. **Tables & Indexes**:
   - `profiles` (references `auth.users(id)` ON DELETE CASCADE)
   - `cities` (unique slug, defaults)
   - `auditoriums` (FKs to `profiles` and `cities`, indexes on `city_id`, `owner_id`, `verified`)
   - `pricing_slots` (FK to `auditoriums` ON DELETE CASCADE, unique `(auditorium_id, date)`, index on `(auditorium_id, date)`)
   - `bookings` (FKs to `profiles` and `auditoriums`, indexes on `customer_id`, `auditorium_id`, `date`)
3. **Security (RLS)**:
   - Enabled RLS on all 5 tables
   - `is_admin()` helper function with `SECURITY DEFINER`
   - Idempotent policies (`DROP POLICY IF EXISTS` + `CREATE POLICY`) covering all required customer, vendor, admin, and public access patterns
4. **Triggers**:
   - `handle_new_user()` trigger on `auth.users` inserting into `profiles` on registration

## Verification
- File exists and is non-empty (258 lines)
- Validated structure and order matching specification
