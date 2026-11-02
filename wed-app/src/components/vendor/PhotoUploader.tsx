import React, { useState, useRef } from 'react'
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface PhotoUploaderProps {
  auditoriumId: string
  existingPhotos: string[]
  onUpdate: (urls: string[]) => void
}

export function PhotoUploader({ auditoriumId, existingPhotos, onUpdate }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setErrorMessage(null)
    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Only JPEG, PNG, and WebP images are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds 5MB limit.`)
        return
      }
      validFiles.push(file)
    }

    if (existingPhotos.length + validFiles.length > 10) {
      setErrorMessage('You can upload a maximum of 10 photos.')
      return
    }

    setIsUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`)

        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${auditoriumId}/${Date.now()}-${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from('auditorium-photos')
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('auditorium-photos')
          .getPublicUrl(filePath)

        if (urlData?.publicUrl) {
          newUrls.push(urlData.publicUrl)
        }
      }

      onUpdate([...existingPhotos, ...newUrls])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Ensure "auditorium-photos" bucket exists and is public.'
      setErrorMessage(msg)
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = (photoUrl: string) => {
    const updated = existingPhotos.filter((p) => p !== photoUrl)
    onUpdate(updated)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Venue Photo Gallery</h3>
          <p className="text-sm text-gray-500">
            High quality photos increase bookings by over 80%. Max 10 photos (5MB each).
          </p>
        </div>
        <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">
          {existingPhotos.length} / 10 Photos
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-brand-primary/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-white hover:bg-brand-accent/30 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading || existingPhotos.length >= 10}
        />

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary mb-3 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>
          <p className="text-base font-medium text-gray-800">
            {isUploading ? uploadProgress : 'Click or drag images here to upload'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Supports JPEG, PNG, WebP up to 5MB</p>
        </div>
      </div>

      {/* Existing Photos Grid */}
      {existingPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingPhotos.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 shadow-sm"
            >
              <img
                src={url}
                alt={`Auditorium photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(url)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 bg-brand-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No photos uploaded yet</p>
        </div>
      )}
    </div>
  )
}

export default PhotoUploader

