import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Pencil,
  Upload,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCategoriesStore, type CategoryOffer } from '../store/categoriesStore'
import { uploadOrConvertPhoto, uploadDataUrlToCloud } from '../lib/imageUtils'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

  const { categories, updateCategory, resetCategories } = useCategoriesStore()

  // Admin edit modal state
  const [editingCategory, setEditingCategory] = useState<CategoryOffer | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  const [tempSubtitle, setTempSubtitle] = useState('')
  const [tempBadge, setTempBadge] = useState('')
  const [tempImageUrl, setTempImageUrl] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const openAdminEdit = (e: React.MouseEvent, cat: CategoryOffer) => {
    e.stopPropagation()
    setEditingCategory(cat)
    setTempTitle(cat.title)
    setTempSubtitle(cat.subtitle)
    setTempBadge(cat.badge)
    setTempImageUrl(cat.imageUrl)
    setSaveSuccess(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const uploadedUrl = await uploadOrConvertPhoto(file, 'categories')
      setTempImageUrl(uploadedUrl)
    } catch (err) {
      console.error('Failed to upload category image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    let finalUrl = tempImageUrl.trim() || editingCategory.imageUrl
    if (finalUrl.startsWith('data:') || finalUrl.startsWith('blob:')) {
      finalUrl = await uploadDataUrlToCloud(finalUrl, 'categories')
    }
    updateCategory(editingCategory.id, {
      title: tempTitle.trim() || editingCategory.title,
      subtitle: tempSubtitle.trim() || editingCategory.subtitle,
      badge: tempBadge.trim() || editingCategory.badge,
      imageUrl: finalUrl,
    })
    setSaveSuccess(true)
    setTimeout(() => {
      setEditingCategory(null)
      setSaveSuccess(false)
    }, 600)
  }

  return (
    <Layout hideHeaderOnMobile>
      {/* ─── Mobile Version (strictly matching screenshot: 4 boxes in 2x2 grid of this exact size) ─── */}
      <div className="md:hidden min-h-screen bg-[#FDFDFD] pb-24">
        {/* Top Black Header Bar: < Back & User Avatar in gold matching screenshot */}
        <header className="sticky top-0 z-30 bg-[#0E0E0E] border-b-2 border-[#D4AF37] px-4 py-3.5 flex items-center justify-between text-white shadow-md">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[#D4AF37] hover:text-white font-bold text-sm transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(user ? '/profile' : '/auth/login')}
            className="text-[#D4AF37] hover:text-white p-1 transition-colors"
            aria-label="Account"
          >
            <User className="w-6 h-6 stroke-2" />
          </button>
        </header>

        {/* Section Heading matching screenshot */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-[2px] bg-[#B8710B]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#B8710B]">
              CATEGORIES
            </span>
          </div>

          <h1
            className="text-2xl font-extrabold text-[#111] tracking-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Explore all categories
          </h1>
        </div>

        {/* 2x2 Grid: 4 Boxes of the exact size from the uploaded screenshot */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(cat.route)}
                className="group relative rounded-2xl border border-gray-200/90 bg-white p-3.5 text-left shadow-2xs active:scale-98 transition-all flex flex-col justify-between cursor-pointer"
              >
                {/* Visual Image container with size matching the uploaded screenshot */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-50 mb-3 relative">
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white/90 drop-shadow-xs">
                    {cat.badge}
                  </span>
                </div>

                {/* Title + Golden Chevron Arrow matching screenshot */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-900 group-hover:text-[#B8710B] transition-colors leading-tight line-clamp-1">
                    {cat.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37] shrink-0 stroke-[2.5]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Desktop Version (kept completely intact: "the desktop version is perfect") ─── */}
      <div className="hidden md:block min-h-screen bg-[#F0F9F8] text-[#5A172D] pb-24 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
          {/* Top Breadcrumb Navigation: Home / Services */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link to="/" className="hover:text-[#C83B68] transition-colors font-medium">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-semibold">Services</span>
          </nav>

          {/* Hero Banner Card matching desktop layout with MANA VENUES styling */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FFF8FA] to-[#F0F9F8] border border-[#E8ECEB] p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10 shadow-xs">
            {/* Soft Ambient Radial Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4AF37]/15 via-[#C83B68]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="relative z-10 max-w-3xl">
              {/* Badge: • ALL SERVICES */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5DE] border border-[#F2DEB0] text-[#B8710B] text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8710B] animate-pulse" />
                <span>ALL SERVICES</span>
              </div>

              {/* Heading: What are you looking for? (Same unified font style for all words) */}
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight leading-tight mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                What are you{' '}
                <span className="text-[#B8710B]">
                  looking for?
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                Browse our curated destination wedding, photography, banquet catering, and bridal styling packages across God's Own Country.
              </p>
            </div>
          </div>

          {/* Section Heading & Admin Reset Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-[2px] bg-[#B8710B]" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#B8710B]">
                  SERVICES & PACKAGES
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111] tracking-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Explore all categories
              </h2>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EBF7F5] text-[#2F6F65] px-2.5 py-1 rounded-full border border-[#BCE3DD]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Image Studio Active
                </span>
                <button
                  type="button"
                  onClick={resetCategories}
                  title="Reset to default category images"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-[#C83B68] bg-white border border-gray-200 px-3 py-1 rounded-full shadow-2xs hover:bg-gray-50 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            )}
          </div>

          {/* 4 Core Category Cards Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(cat.route)}
                className="group relative rounded-3xl border border-[#E5ECEB] bg-white overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-[#C83B68]/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Admin Quick Edit Button */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => openAdminEdit(e, cat)}
                    title="Change category image & details (Admin)"
                    className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#C83B68] shadow-md border border-gray-200 transition-all active:scale-95"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* AI / High-Resolution Image Container */}
                <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-gray-100">
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Badge Pill on image */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/20 shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      {cat.badge}
                    </span>
                  </div>

                  {/* Image title overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3
                      className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-sm leading-tight"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {cat.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Footer */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {cat.subtitle}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#C83B68] transition-colors">
                    <span>Explore Packages</span>
                    <span className="w-7 h-7 rounded-full bg-[#FFF2F6] flex items-center justify-center text-[#C83B68] group-hover:bg-[#C83B68] group-hover:text-white transition-all shadow-2xs">
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Image & Content Editor Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF2F6] flex items-center justify-center text-[#C83B68]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Edit Category: {editingCategory.title}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Update the AI/featured image, title, and description
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {/* Preview image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Current Image Preview
                </label>
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                  <img
                    src={tempImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs rounded-lg px-2.5 py-1 text-[11px] text-white truncate">
                    {tempImageUrl}
                  </div>
                </div>
              </div>

              {/* Upload or Image URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Image Source
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="Paste image URL (Unsplash, Cloudinary, etc.)..."
                    className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0">
                    <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Badge Pill
                  </label>
                  <input
                    type="text"
                    value={tempBadge}
                    onChange={(e) => setTempBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={tempSubtitle}
                  onChange={(e) => setTempSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#C83B68] hover:bg-[#b03058] rounded-xl shadow-md transition-all active:scale-95"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
