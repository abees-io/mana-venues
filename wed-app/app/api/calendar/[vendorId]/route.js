import ical from 'ical-generator'
import { supabaseAdmin } from '@/app/api/_lib/supabaseAdmin'

export async function GET(request, { params }) {
  try {
    const { vendorId } = await params
    const cleanVendorId = (vendorId || '').replace(/\.ics$/i, '').trim()

    if (!cleanVendorId) {
      return new Response('Missing vendor ID', { status: 400 })
    }

    const { data: venue } = await supabaseAdmin
      .from('auditoriums')
      .select('id, title')
      .eq('id', cleanVendorId)
      .single()

    const venueTitle = venue?.title || 'Mana Partner Venue'

    const { data: bookedRows, error: bookedError } = await supabaseAdmin
      .from('availability_blocks')
      .select('id, event_date, booking_id, created_at')
      .eq('vendor_id', cleanVendorId)
      .eq('status', 'booked')

    if (bookedError) {
      return new Response(`Database error: ${bookedError.message}`, { status: 500 })
    }

    const calendar = ical({
      name: `${venueTitle} - Mana Wedding Bookings`,
      description: `Official confirmed wedding booking feed for ${venueTitle} via Mana Venues Kerala`,
      timezone: 'Asia/Kolkata',
      ttl: 60 * 15,
    })

    for (const row of bookedRows || []) {
      const [year, month, day] = row.event_date.split('-').map(Number)
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
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

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${cleanVendorId}-mana.ics"`,
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    })
  } catch (err) {
    return new Response('Error generating calendar feed', { status: 500 })
  }
}
