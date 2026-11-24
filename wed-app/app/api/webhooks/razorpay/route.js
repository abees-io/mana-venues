import crypto from 'crypto'
import { supabaseAdmin } from '@/app/api/_lib/supabaseAdmin'

export async function POST(request) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    const rawBody = await request.text()

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (expectedSignature !== signature) {
        return Response.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload?.event
    const payment = payload?.payload?.payment?.entity
    const order = payload?.payload?.order?.entity

    if (event === 'payment.captured' || event === 'order.paid') {
      const notes = payment?.notes || order?.notes || {}
      const bookingId = notes.booking_id
      const vendorId = notes.vendor_id
      const datesStr = notes.dates

      if (bookingId || vendorId) {
        let updateQuery = supabaseAdmin
          .from('availability_blocks')
          .update({
            status: 'booked',
            hold_expires_at: null,
          })

        if (bookingId) {
          updateQuery = updateQuery.eq('booking_id', bookingId)
        } else if (vendorId && datesStr) {
          const dateList = datesStr.split(',').map((s) => s.trim())
          updateQuery = updateQuery.eq('vendor_id', vendorId).in('event_date', dateList)
        }

        await updateQuery
      }
    }

    return Response.json({ status: 'ok' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
