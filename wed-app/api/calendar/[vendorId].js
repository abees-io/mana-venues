import ical from 'ical-generator'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'

/**
 * Outbound iCal Feed Route:
 * Accessible at `/api/calendar/[vendorId].ics` (or query `?vendorId=...`).
 * Returns a valid iCalendar feed with all confirmed 'booked' dates labeled 'Mana Wedding Booking'.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed')
  }

  try {
    const { vendorId } = req.query
    const cleanVendorId = (vendorId || '').replace(/\.ics$/i, '').trim()

    if (!cleanVendorId) {
      return res.status(400).send('Missing vendor ID')
    }

    // 1. Fetch venue details for feed metadata
    const { data: venue } = await supabaseAdmin
      .from('auditoriums')
      .select('id, title')
      .eq('id', cleanVendorId)
      .single()

    const venueTitle = venue?.title || 'Mana Partner Venue'

    // 2. Fetch all confirmed 'booked' dates
    const { data: bookedRows, error: bookedError } = await supabaseAdmin
      .from('availability_blocks')
      .select('id, event_date, booking_id, created_at')
      .eq('vendor_id', cleanVendorId)
      .eq('status', 'booked')

    if (bookedError) {
      throw new Error(`Database error: ${bookedError.message}`)
    }

    // 3. Generate .ics feed
    const calendar = ical({
      name: `${venueTitle} - Mana Wedding Bookings`,
      description: `Official confirmed wedding booking feed for ${venueTitle} via Mana Venues Kerala`,
      timezone: 'Asia/Kolkata',
      ttl: 60 * 15, // 15-minute refresh recommendation
    })

    for (const row of bookedRows || []) {
      const [year, month, day] = row.event_date.split('-').map(Number)
      // All-day calendar event
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
      // iCal specification for 1-day all-day event ends at midnight the following day
      const endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0))

      calendar.createEvent({
        id: `mana-booking-${row.id}@manavenues.com`,
        start: startDate,
        end: endDate,
        allDay: true,
        summary: 'Mana Wedding Booking',
        description: `Confirmed Wedding Booking at ${venueTitle}. Reference: ${row.booking_id || row.id}`,
        location: venueTitle,
        status: 'CONFIRMED',
        created: row.created_at ? new Date(row.created_at) : new Date(),
      })
    }

    const icsContent = calendar.toString()

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', `inline; filename="${cleanVendorId}-mana.ics"`)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')

    return res.status(200).send(icsContent)
  } catch (err) {
    console.error('Outbound iCal generation error:', err)
    return res.status(500).send('Error generating calendar feed')
  }
}
