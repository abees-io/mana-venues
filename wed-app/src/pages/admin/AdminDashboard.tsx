import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  RotateCw,
  Loader2,
  Building2,
  CheckCircle,
} from 'lucide-react'
import { useAdminMetrics } from '../../hooks/useAdminMetrics'
import { PlatformMetricsPanel } from '../../components/admin/PlatformMetricsPanel'
import Layout from '../../components/layout/Layout'

export function AdminDashboard() {
  const { data: metrics, isLoading, isRefetching, refetch } = useAdminMetrics()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary">
                Super Admin
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Platform-wide performance, financial revenue shares, and auditorium verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/verification"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/90 shadow-sm transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              Venue Verification Queue
            </Link>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh platform stats"
            >
              <RotateCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/admin/verification"
            className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-amber-900">
                  Hall Verification Queue
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Approve or reject newly registered vendor venues
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-200/70 px-2.5 py-1 rounded-full">
              Review →
            </span>
          </Link>

          <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Platform Health</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Database & Razorpay Webhook Gateway Online
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-200/70 px-2.5 py-1 rounded-full">
              99.9% Up
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-3" />
            <p className="text-sm font-medium">Aggregating platform metrics...</p>
          </div>
        ) : metrics ? (
          <PlatformMetricsPanel metrics={metrics} />
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">Could not retrieve metrics at this time.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminDashboard
