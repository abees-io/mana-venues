import ical from 'node-ical'
import { supabaseAdmin } from '@/app/api/_lib/supabaseAdmin'
import { expandDateRangeIST } from '@/app/api/_lib/dateUtils'

export async function GET(request) {
  return handleSync(request)
}

export async function POST(request) {
  return handleSync(request)
}

async function handleSync(request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const cronSecret = process.env.CRON_SECRET
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()

    const { searchParams } = new URL(request.url)
    let bodyVendorId = null
    try {
      const body = await request.json()
      bodyVendorId = body?.vendorId
    } catch {
      // not json or empty
    }
    const queryVendorId = searchParams.get('vendorId') || bodyVendorId

    const isCronAuthorized = Boolean(cronSecret && token === cronSecret)
    const isVendorAuthorized = Boolean(queryVendorId)

    if (!isCronAuthorized && !isVendorAuthorized) {
      return Response.json(
        { error: 'Unauthorized: Missing valid CRON_SECRET or vendor authorization' },
        { status: 401 }
      )
    }

    let query = supabaseAdmin
      .from('auditoriums')
      .select('id, title, ical_import_url, ical_last_synced_at')
      .not('ical_import_url', 'is', null)

    if (queryVendorId) {
      query = query.eq('id', queryVendorId)
    }

    const { data: venues, error: venueError } = await query

    if (venueError) {
      return Response.json({ error: venueError.message }, { status: 500 })
    }

    const syncResults = []

    for (const venue of venues || []) {
      const rawUrl = venue.ical_import_url?.trim()
      if (!rawUrl) continue

      const httpsUrl = rawUrl.replace(/^webcal:\/\//i, 'https://')

      try {
        const parsedEvents = await ical.async.fromURL(httpsUrl)
        const incomingBlockedDatesSet = new Set()

        for (const k in parsedEvents) {
          if (!Object.prototype.hasOwnProperty.call(parsedEvents, k)) continue
          const ev = parsedEvents[k]
          if (ev.type !== 'VEVENT' || !ev.start) continue

          const start = new Date(ev.start)
          let end = ev.end ? new Date(ev.end) : new Date(start)

          if (ev.end && end.getTime() > start.getTime() && ev.datetype === 'date') {
            end = new Date(end.getTime() - 1000)
          }

          const datesInRange = expandDateRangeIST(start, end)
          for (const d of datesInRange) {
            incomingBlockedDatesSet.add(d)
          }
        }

        const incomingDatesArray = Array.from(incomingBlockedDatesSet)

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
          } else if (existing.status === 'held' && existing.hold_expires_at && existing.hold_expires_at <= now) {
            datesToInsert.push({
              vendor_id: venue.id,
              event_date: dateStr,
              status: 'blocked_external',
              created_at: now,
            })
          }
        }

        if (datesToInsert.length > 0) {
          await supabaseAdmin
            .from('availability_blocks')
            .upsert(datesToInsert, { onConflict: 'vendor_id,event_date' })
        }

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

    return Response.json({
      success: true,
      syncedAt: new Date().toISOString(),
      results: syncResults,
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
