import crypto from 'crypto'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'

/**
 * Razorpay Webhook Handler:
 * - Verifies X-Razorpay-Signature header using RAZORPAY_WEBHOOK_SECRET
 * - On `payment.captured` or `order.paid`, transitions matching availability_blocks
 *   from 'held' to 'booked' and nullifies hold_expires_at
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const signature = req.headers['x-razorpay-signature']
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    // 1. Verify Webhook Signature if secret configured
    if (webhookSecret && signature) {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (expectedSignature !== signature) {
        console.error('Razorpay signature verification failed')
        return res.status(400).json({ error: 'Invalid signature' })
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const event = payload?.event
    const payment = payload?.payload?.payment?.entity
    const order = payload?.payload?.order?.entity

    // Check payment.captured or order.paid
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

        const { data: updated, error: updateErr } = await updateQuery

        if (updateErr) {
          console.error('Error locking booked dates in webhook:', updateErr)
        } else {
          console.log(`Successfully locked dates to 'booked' for booking ${bookingId}`)
        }
      }
    }

    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    console.error('Razorpay Webhook Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
