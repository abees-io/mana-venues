import ical from 'node-ical'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { extractBearerToken, verifySupabaseUser, verifyVendorOwnership } from '../_lib/auth.js'
import { expandDateRangeIST } from '../_lib/dateUtils.js'

function isSafeHttpsUrl(rawUrl) {
  try {
    const normalized = rawUrl.trim().replace(/^webcal:\/\//i, 'https://')
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:') return null
    const host = parsed.hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.')
    ) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Inbound iCal Sync Handler:
 * - Supports cron synchronization (secured with CRON_SECRET)
 * - Supports vendor on-demand synchronization verified via Supabase JWT + ownership check
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const cronSecret = process.env.CRON_SECRET
    const token = extractBearerToken(req)
    const queryVendorId = req.query?.vendorId || req.body?.vendorId

    const isCronAuthorized = Boolean(cronSecret && token === cronSecret)

    if (!isCronAuthorized) {
      const { user, role, error: authError } = await verifySupabaseUser(req)
      if (authError || !user) {
        return res.status(401).json({ error: authError || 'Unauthorized: Missing valid CRON_SECRET or session token' })
      }
      if (!queryVendorId) {
        if (role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: vendorId required for non-admin sync' })
        }
      } else {
        const ownsTarget = await verifyVendorOwnership(user, role, queryVendorId)
        if (!ownsTarget) {
          return res.status(403).json({ error: 'Forbidden: You do not own this venue or calendar' })
        }
      }
    }

    // 1. Fetch listings/auditoriums with a configured ical_import_url
    let query = supabaseAdmin
      .from('auditoriums')
      .select('id, title, ical_import_url, ical_last_synced_at')
      .not('ical_import_url', 'is', null)

    if (queryVendorId) {
      query = query.eq('id', queryVendorId)
    }

    const { data: venues, error: venueError } = await query

    if (venueError) {
      throw new Error(`Database error fetching venues: ${venueError.message}`)
    }

    const syncResults = []

    for (const venue of venues || []) {
      const rawUrl = venue.ical_import_url?.trim()
      if (!rawUrl) continue

      // Enforce strict HTTPS iCal URL (converts webcal:// to https://, blocks http:// & private IPs)
      const httpsUrl = isSafeHttpsUrl(rawUrl)
      if (!httpsUrl) {
        syncResults.push({
          vendorId: venue.id,
          title: venue.title,
          error: 'Rejected non-HTTPS or unsafe iCal URL',
        })
        continue
      }

      try {
        // Fetch and parse the iCal feed
        const parsedEvents = await ical.async.fromURL(httpsUrl)
        const incomingBlockedDatesSet = new Set()

        for (const k in parsedEvents) {
          if (!Object.prototype.hasOwnProperty.call(parsedEvents, k)) continue
          const ev = parsedEvents[k]
          if (ev.type !== 'VEVENT' || !ev.start) continue

          const start = new Date(ev.start)
          let end = ev.end ? new Date(ev.end) : new Date(start)

          // If end is greater than start, iCal all-day events specify end as the next day at midnight
          // Subtract 1 second so inclusive range matches properly
          if (ev.end && end.getTime() > start.getTime() && ev.datetype === 'date') {
            end = new Date(end.getTime() - 1000)
          }

          const datesInRange = expandDateRangeIST(start, end)
          for (const d of datesInRange) {
            incomingBlockedDatesSet.add(d)
          }
        }

        const incomingDatesArray = Array.from(incomingBlockedDatesSet)

        // 2. Fetch existing availability_blocks for this venue to avoid overwriting 'booked' or active 'held'
        const { data: existingBlocks } = await supabaseAdmin
          .from('availability_blocks')
          .select('id, event_date, status, hold_expires_at')
          .eq('vendor_id', venue.id)

        const existingMap = new Map()
        for (const b of existingBlocks || []) {
          existingMap.set(b.event_date, b)
        }

        const now = new Date().toISOString()
        const datesToInsert = []

        for (const dateStr of incomingDatesArray) {
          const existing = existingMap.get(dateStr)
          if (!existing) {
            datesToInsert.push({
              vendor_id: venue.id,
              event_date: dateStr,
              status: 'blocked_external',
              created_at: now,
            })
          } else if (existing.status === 'blocked_external') {
            // Already blocked externally, leave intact
          } else if (existing.status === 'held' && existing.hold_expires_at && existing.hold_expires_at <= now) {
            // Hold has expired, safe to overwrite with external block
            datesToInsert.push({
              vendor_id: venue.id,
              event_date: dateStr,
              status: 'blocked_external',
              created_at: now,
            })
          }
        }

        // Upsert newly blocked dates
        if (datesToInsert.length > 0) {
          await supabaseAdmin
            .from('availability_blocks')
            .upsert(datesToInsert, { onConflict: 'vendor_id,event_date' })
        }

        // 3. Remove stale 'blocked_external' rows that are no longer in the vendor's external calendar
        const staleDateIds = []
        for (const b of existingBlocks || []) {
          if (b.status === 'blocked_external' && !incomingBlockedDatesSet.has(b.event_date)) {
            staleDateIds.push(b.id)
          }
        }

        if (staleDateIds.length > 0) {
          await supabaseAdmin
            .from('availability_blocks')
            .delete()
            .in('id', staleDateIds)
        }

        // 4. Update ical_last_synced_at
        await supabaseAdmin
          .from('auditoriums')
          .update({ ical_last_synced_at: now })
          .eq('id', venue.id)

        syncResults.push({
          vendorId: venue.id,
          title: venue.title,
          importedDatesCount: incomingDatesArray.length,
          staleDatesRemoved: staleDateIds.length,
          status: 'success',
        })
      } catch (venueSyncErr) {
        syncResults.push({
          vendorId: venue.id,
          title: venue.title,
          status: 'error',
          error: venueSyncErr.message,
        })
      }
    }

    return res.status(200).json({
      success: true,
      syncedAt: new Date().toISOString(),
      results: syncResults,
    })
  } catch (error) {
    console.error('iCal Inbound Sync Error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
