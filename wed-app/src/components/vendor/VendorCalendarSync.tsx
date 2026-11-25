import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from 'date-fns'
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  CalendarCheck2,
  CalendarX,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatISTDate } from '../../lib/dateUtils'

export interface VendorCalendarSyncProps {
  vendorId: string // Venue ID or Vendor ID
  initialIcalUrl?: string | null
  initialLastSyncedAt?: string | null
  venueTitle?: string
}

interface BlockedRecord {
  id: string
  vendor_id?: string
  event_date: string
  status: 'held' | 'booked' | 'blocked_external'
  booking_id?: string | null
  hold_expires_at?: string | null
}

export default function VendorCalendarSync({
  vendorId,
  initialIcalUrl = '',
  initialLastSyncedAt = null,
  venueTitle: _venueTitle = 'My Listing',
}: VendorCalendarSyncProps) {
  const [icalUrl, setIcalUrl] = useState(initialIcalUrl || '')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(initialLastSyncedAt)
  const [isSavingUrl, setIsSavingUrl] = useState(false)
  const [isSyncingNow, setIsSyncingNow] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  // Interactive Month Grid State
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [blocks, setBlocks] = useState<BlockedRecord[]>([])
  const [, setIsLoadingBlocks] = useState(false)
  const [togglingDate, setTogglingDate] = useState<string | null>(null)

  // Construct Outbound Feed URL
  const outboundFeedUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin.replace(/\/$/, '')
      return `${origin}/api/calendar/${vendorId}.ics`
    }
    return `https://wed-app-one.vercel.app/api/calendar/${vendorId}.ics`
  }, [vendorId])

  // Load blocked dates for the vendor
  const fetchBlocks = useCallback(async () => {
    if (!vendorId) return
    setIsLoadingBlocks(true)
    try {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('id, event_date, status, booking_id, hold_expires_at')
        .eq('vendor_id', vendorId)

      if (!error && data) {
        setBlocks(data as BlockedRecord[])
      }
    } catch (err) {
      console.warn('Error fetching availability blocks:', err)
    } finally {
      setIsLoadingBlocks(false)
    }
  }, [vendorId])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  // Map of blocks by date 'YYYY-MM-DD'
  const blockMap = useMemo(() => {
    const map = new Map<string, BlockedRecord>()
    const now = new Date().toISOString()
    for (const b of blocks) {
      // Ignore expired holds
      if (b.status === 'held' && b.hold_expires_at && b.hold_expires_at <= now) {
        continue
      }
      map.set(b.event_date, b)
    }
    return map
  }, [blocks])

  // Tap-to-Block Month Grid logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd])
  const leadingEmptyCells = getDay(monthStart)
  const today = startOfDay(new Date())

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))

  // Toggle date state on tap
  const handleDateClick = async (date: Date) => {
    const dateStr = formatISTDate(date)
    const existing = blockMap.get(dateStr)

    // Confirmed bookings and active holds are locked
    if (existing?.status === 'booked') {
      alert('This date has a confirmed Mana wedding booking and cannot be unblocked manually.')
      return
    }
    if (existing?.status === 'held') {
      alert('This date is temporarily held for a couple currently at checkout (expires in 15 minutes).')
      return
    }

    setTogglingDate(dateStr)
    setErrorMessage(null)

    try {
      if (existing?.status === 'blocked_external') {
        // Unblock: delete row
        const { error: delError } = await supabase
          .from('availability_blocks')
          .delete()
          .eq('vendor_id', vendorId)
          .eq('event_date', dateStr)

        if (delError) throw delError
        setBlocks((prev) => prev.filter((b) => b.event_date !== dateStr))
      } else {
        // Block: insert 'blocked_external'
        const newRecord: BlockedRecord = {
          id: crypto.randomUUID(),
          vendor_id: vendorId,
          event_date: dateStr,
          status: 'blocked_external',
        }
        const { error: insError } = await (supabase.from('availability_blocks' as any).insert({
          id: newRecord.id,
          vendor_id: vendorId,
          event_date: dateStr,
          status: 'blocked_external',
        }) as any)

        if (insError) throw insError
        setBlocks((prev) => [...prev, newRecord])
      }
    } catch (err: any) {
      console.error('Failed to toggle date availability:', err)
      setErrorMessage(err.message || 'Failed to update date availability')
    } finally {
      setTogglingDate(null)
    }
  }

  // Save Import URL & Sync
  const handleSaveAndSync = async () => {
    if (!vendorId) return
    setIsSavingUrl(true)
    setIsSyncingNow(true)
    setErrorMessage(null)
    setSyncMessage(null)

    try {
      const cleanUrl = icalUrl.trim()
      // 1. Save import URL to auditoriums table
      const { error: updateError } = await (supabase
        .from('auditoriums' as any)
        .update({ ical_import_url: cleanUrl || null } as any)
        .eq('id', vendorId) as any)

      if (updateError) throw updateError

      // 2. Trigger Inbound Sync API with Bearer token
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch(`/api/sync-ical?vendorId=${vendorId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ vendorId }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync iCal calendar')
      }

      const resItem = result.results?.[0]
      const importedCount = resItem?.importedDatesCount ?? 0
      const nowIso = new Date().toISOString()
      setLastSyncedAt(nowIso)
      setSyncMessage(`Synced successfully! ${importedCount} blocked date(s) imported from external calendar.`)

      // Refresh availability blocks
      await fetchBlocks()
    } catch (err: any) {
      console.error('Sync error:', err)
      setErrorMessage(err.message || 'Failed to sync external calendar. Please check the URL format.')
    } finally {
      setIsSavingUrl(false)
      setIsSyncingNow(false)
    }
  }

  // Copy outbound feed URL
  const handleCopyFeed = async () => {
    try {
      await navigator.clipboard.writeText(outboundFeedUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2400)
    } catch {
      // fallback
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-[#D8F0EC] shadow-xl overflow-hidden text-[#5A172D] p-5 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7E1F3E] to-[#C83B68] text-white flex items-center justify-center shadow-md">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#7E1F3E]">
              Calendar & Two-Way iCal Sync
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage your availability, block custom dates, and sync with Google or Apple Calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastSyncedAt && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced {format(new Date(lastSyncedAt), 'MMM d, h:mm a')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Manual Tap-to-Block Month Grid */}
        <div className="lg:col-span-7 bg-[#FFF8FA] rounded-2xl p-5 border border-[#FAD2DF] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#7E1F3E] flex items-center gap-2">
                <span>Monthly Availability Grid</span>
                <span className="text-xs font-normal text-gray-500">(Tap any date to toggle block)</span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Dates in pink are blocked from customer bookings. Green dates are open.
              </p>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 transition"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#7E1F3E] px-2 min-w-[100px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-700 transition"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider py-1 border-b border-gray-200">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {/* Empty slots for month start alignment */}
            {Array.from({ length: leadingEmptyCells }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-12 sm:h-14 rounded-xl bg-transparent" />
            ))}

            {daysInMonth.map((dayDate) => {
              const dateStr = formatISTDate(dayDate)
              const isPast = isBefore(dayDate, today)
              const block = blockMap.get(dateStr)
              const isBooked = block?.status === 'booked'
              const isHeld = block?.status === 'held'
              const isBlocked = block?.status === 'blocked_external'
              const isToggling = togglingDate === dateStr

              let cellStyle = 'bg-white hover:border-[#C83B68] text-gray-800 border-gray-200'
              let badge = null

              if (isPast) {
                cellStyle = 'bg-gray-100/60 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
              } else if (isBooked) {
                cellStyle = 'bg-gradient-to-tr from-[#7E1F3E] to-[#A82B54] text-white border-transparent shadow-xs cursor-not-allowed'
                badge = 'Booked'
              } else if (isHeld) {
                cellStyle = 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs cursor-not-allowed'
                badge = 'Held (15m)'
              } else if (isBlocked) {
                cellStyle = 'bg-[#FFE2EC] text-[#911F45] border-[#F89BB5] shadow-xs hover:bg-[#FFD0DE]'
                badge = 'Blocked'
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast || isBooked || isHeld || isToggling}
                  onClick={() => handleDateClick(dayDate)}
                  className={`relative h-12 sm:h-14 p-1.5 rounded-xl border flex flex-col justify-between items-start text-left transition-all active:scale-95 cursor-pointer select-none ${cellStyle}`}
                >
                  <span className="text-xs sm:text-sm font-bold leading-none">
                    {format(dayDate, 'd')}
                  </span>

                  {badge ? (
                    <span className="text-[9px] font-bold uppercase tracking-tight truncate w-full flex items-center gap-0.5">
                      {isBooked && <Lock className="w-2.5 h-2.5 shrink-0" />}
                      <span>{badge}</span>
                    </span>
                  ) : !isPast ? (
                    <span className="text-[9px] font-semibold text-emerald-600 truncate">
                      Open
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200 text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-gray-300" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FFE2EC] border border-[#F89BB5]" />
              <span>Manually / iCal Blocked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#7E1F3E]" />
              <span>Confirmed Booking</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-200 border border-amber-400" />
              <span>Checkout Hold</span>
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): iCal Inbound & Outbound Sync controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Import External iCal (Google / Apple -> Mana) */}
          <div className="bg-[#F0F9F8] rounded-2xl p-5 border border-[#D8F0EC] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#7E1F3E]">
              <CalendarX className="w-5 h-5 text-[#C83B68]" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                1. Import External Calendar (Google / Apple)
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Paste your personal or business iCal link. Mana will automatically block dates when you have external events so you never get double-booked.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#5A172D]">
                Your iCal / .ics Address:
              </label>
              <input
                type="url"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                placeholder="https://calendar.google.com/.../basic.ics"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm outline-none focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 transition"
              />
            </div>

            <button
              type="button"
              disabled={isSavingUrl || isSyncingNow}
              onClick={handleSaveAndSync}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#7E1F3E] via-[#A82B54] to-[#C83B68] hover:brightness-105 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncingNow ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing External Calendar...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Save & Sync Now</span>
                </>
              )}
            </button>

            {/* Sync Notifications */}
            {syncMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{syncMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Box 2: Export Calendar (Mana -> Vendor's Phone) */}
          <div className="bg-[#FFFDF0] rounded-2xl p-5 border border-[#FBEEC8] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#7E1F3E]">
              <CalendarCheck2 className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wide">
                2. Export Mana Bookings to Your Phone
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Subscribe to this live feed in your iPhone or Google Calendar to see your confirmed Mana wedding bookings right on your mobile calendar.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5A172D]">
                Your Private Mana iCal Feed URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={outboundFeedUrl}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono text-[11px] text-gray-600 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyFeed}
                  className="shrink-0 p-2.5 rounded-xl bg-[#7E1F3E] text-white hover:bg-[#A82B54] transition shadow-xs cursor-pointer"
                  title="Copy Link"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {isCopied && (
                <p className="text-[11px] font-bold text-emerald-600">
                  Copied link to clipboard!
                </p>
              )}
            </div>
          </div>

          {/* Box 3: Collapsible Beginner Setup Guide */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-[#7E1F3E] hover:bg-gray-50 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C83B68]" />
                <span>Beginner Setup Guide: How to get your iCal link</span>
              </span>
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGuide && (
              <div className="p-4 pt-0 border-t border-gray-100 text-xs text-gray-600 space-y-3 bg-[#FAF8F9]">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Google Calendar (Desktop):</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Google Calendar on your browser and click the gear ⚙️ icon &gt; <strong>Settings</strong>.</li>
                    <li>On the left menu, click your calendar under <strong>Settings for my calendars</strong>.</li>
                    <li>Scroll down to <strong>Integrate calendar</strong>.</li>
                    <li>Copy the <strong>Secret address in iCal format</strong> URL (ends with .ics) and paste it into Step 1 above.</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Apple Calendar (iPhone / Mac):</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Calendar on iPhone or Mac.</li>
                    <li>Tap <strong>Calendars</strong> at the bottom, then tap the (i) info icon next to your calendar.</li>
                    <li>Turn on <strong>Public Calendar</strong> and tap <strong>Share Link</strong>.</li>
                    <li>Copy the link and paste it into Step 1 above (Mana automatically converts webcal:// to https://).</li>
                  </ol>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Pro-Tip:</strong> Create a dedicated sub-calendar named <em>"Wedding Bookings"</em> so personal doctor appointments don't block your wedding availability!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
