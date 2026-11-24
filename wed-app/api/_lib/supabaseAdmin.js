import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Warning: Missing Supabase server credentials. Check environment variables.')
}

/**
 * Server-side Supabase client using Service Role key to bypass RLS for administrative tasks
 * (such as background iCal sync cron, hold expirations, and Razorpay webhook updates).
 */
export const supabaseAdmin = createClient(
  (supabaseUrl || 'https://efhmmsprizhptpecllrh.supabase.co').replace(/\/$/, ''),
  serviceRoleKey || 'anon'
)
