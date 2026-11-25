import { supabaseAdmin } from './supabaseAdmin.js'

/**
 * Extracts the Bearer JWT from an incoming request's Authorization header.
 * Supports both Node/Vercel IncomingMessage and Web Fetch Request headers.
 */
export function extractBearerToken(req) {
  const authHeader =
    typeof req.headers?.get === 'function'
      ? req.headers.get('authorization') || ''
      : req.headers?.authorization || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

/**
 * Verifies the user's Supabase JWT session token on the server side using
 * `supabaseAdmin.auth.getUser(token)` and resolves their authoritative role
 * from the `profiles` table (never trusting client-supplied user_id or role).
 */
export async function verifySupabaseUser(req) {
  const token = extractBearerToken(req)
  if (!token) {
    return { user: null, profile: null, role: null, error: 'Unauthorized: Missing Bearer token' }
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) {
    return { user: null, profile: null, role: null, error: 'Unauthorized: Invalid or expired session token' }
  }

  const user = data.user
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, email, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || user.app_metadata?.role || 'customer'
  return { user, profile, role, error: null }
}

/**
 * Prevents IDOR by verifying the authenticated user owns `targetVendorOrVenueId`
 * (either matching `user.id` directly or owning the auditorium row), or is an admin.
 */
export async function verifyVendorOwnership(user, role, targetVendorOrVenueId) {
  if (!user || !targetVendorOrVenueId) return false
  if (role === 'admin') return true
  if (targetVendorOrVenueId === user.id) return true

  const { data: venue } = await supabaseAdmin
    .from('auditoriums')
    .select('id, owner_id')
    .eq('id', targetVendorOrVenueId)
    .maybeSingle()

  return Boolean(venue && venue.owner_id === user.id)
}
