import Razorpay from 'razorpay'
import { supabaseAdmin } from '@/app/api/_lib/supabaseAdmin'
import { expandDateRangeIST } from '@/app/api/_lib/dateUtils'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      vendorId,
      dates,
      startDate,
      endDate,
      advanceAmount,
      auditoriumTitle,
    } = body || {}

    if (!vendorId) {
      return Response.json({ error: 'Missing vendorId' }, { status: 400 })
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
      return Response.json({ error: 'No booking dates provided' }, { status: 400 })
    }

    const tempBookingId = crypto.randomUUID()

    const { data: holdResult, error: rpcError } = await supabaseAdmin.rpc('hold_booking_dates', {
      p_vendor_id: vendorId,
      p_dates: requestedDates,
      p_booking_id: tempBookingId,
    })

    if (rpcError) {
      return Response.json({ error: `Hold operation failed: ${rpcError.message}` }, { status: 500 })
    }

    if (!holdResult?.success) {
      return Response.json({
        error: holdResult?.error || 'One or more selected dates are already booked or held by another couple.',
        conflicts: holdResult?.conflicts || [],
      }, { status: 409 })
    }

    const key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    let razorpayOrderId = `order_hold_${tempBookingId.slice(0, 14)}`

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
    }

    return Response.json({
      success: true,
      bookingId: tempBookingId,
      orderId: razorpayOrderId,
      amount: advanceAmount,
      holdExpiresAt: holdResult.hold_expires_at,
      heldDates: requestedDates,
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
