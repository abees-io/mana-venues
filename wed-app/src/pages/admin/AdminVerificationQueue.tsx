import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, RotateCw, Loader2, PartyPopper } from 'lucide-react'
import { useVerificationQueue } from '../../hooks/useVerificationQueue'
import { AuditoriumVerificationCard } from '../../components/admin/AuditoriumVerificationCard'
import Layout from '../../components/layout/Layout'

export function AdminVerificationQueue() {
  const {
    auditoriums,
    isLoading,
    isRefetching,
    refetch,
    approveAuditorium,
    rejectAuditorium,
  } = useVerificationQueue()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Auditorium Verification Queue</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {auditoriums.length} Pending
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review submitted venue details, photos, and vendor contacts before approving for public search.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="self-start sm:self-center p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 text-xs font-semibold"
          >
            <RotateCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Queue Grid or Empty State */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-3" />
            <p className="text-sm font-medium">Loading unverified auditoriums...</p>
          </div>
        ) : auditoriums.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">All Venues are Verified!</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              There are no pending auditoriums awaiting review right now. Newly registered halls will automatically appear here.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-brand-primary/90"
            >
              <ShieldCheck className="w-4 h-4" />
              Return to Admin Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditoriums.map((auditorium) => (
              <AuditoriumVerificationCard
                key={auditorium.id}
                auditorium={auditorium}
                onApprove={approveAuditorium}
                onReject={rejectAuditorium}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminVerificationQueue
