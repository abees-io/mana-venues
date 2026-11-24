import Razorpay from 'razorpay'
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { expandDateRangeIST } from '../../_lib/dateUtils.js'

/**
 * Checkout Hold Route:
 * - Locks requested date(s) for 15 minutes via atomic Postgres RPC `hold_booking_dates`
 * - If unavailable, returns 409 Conflict with collision details
 * - If locked, creates Razorpay Order and returns order_id
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const {
      vendorId,
      dates, // Array of 'YYYY-MM-DD' or startDate & endDate
      startDate,
      endDate,
      advanceAmount,
      customerDetails,
      auditoriumTitle,
    } = req.body || {}

    if (!vendorId) {
      return res.status(400).json({ error: 'Missing vendorId' })
    }

    let requestedDates = []
    if (Array.isArray(dates) && dates.length > 0) {
      requestedDates = dates
    } else if (startDate && endDate) {
      requestedDates = expandDateRangeIST(startDate, endDate)
    } else if (startDate) {
      requestedDates = [startDate]
    }

    if (requestedDates.length === 0) {
      return res.status(400).json({ error: 'No booking dates provided' })
    }

    // Temporary booking tracking ID
    const tempBookingId = crypto.randomUUID()

    // 1. Call atomic PostgreSQL RPC function
    const { data: holdResult, error: rpcError } = await supabaseAdmin.rpc('hold_booking_dates', {
      p_vendor_id: vendorId,
      p_dates: requestedDates,
      p_booking_id: tempBookingId,
    })

    if (rpcError) {
      console.error('RPC hold_booking_dates error:', rpcError)
      return res.status(500).json({ error: `Hold operation failed: ${rpcError.message}` })
    }

    if (!holdResult?.success) {
      return res.status(409).json({
        error: holdResult?.error || 'One or more selected dates are already booked or held by another couple.',
        conflicts: holdResult?.conflicts || [],
      })
    }

    // 2. Initialize Razorpay client
    const key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    let razorpayOrderId = null

    if (key_id && key_secret) {
      const razorpay = new Razorpay({ key_id, key_secret })
      const amountInPaise = Math.round(Number(advanceAmount || 10000) * 100)

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${tempBookingId.slice(0, 16)}`,
        notes: {
          booking_id: tempBookingId,
          vendor_id: vendorId,
          dates: requestedDates.join(','),
          auditoriumTitle: auditoriumTitle || 'Mana Venue',
        },
      })

      razorpayOrderId = order.id
    } else {
      // In development/test mode without live keys, generate fallback order id
      razorpayOrderId = `order_test_${tempBookingId.slice(0, 14)}`
    }

    return res.status(200).json({
      success: true,
      bookingId: tempBookingId,
      orderId: razorpayOrderId,
      amount: advanceAmount,
      holdExpiresAt: holdResult.hold_expires_at,
      heldDates: requestedDates,
    })
  } catch (err) {
    console.error('Booking initiation error:', err)
    return res.status(500).json({ error: err.message })
  }
}
