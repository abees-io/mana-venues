import { supabase } from './supabase'

/**
 * Compresses and resizes an image File into an optimized WebP or JPEG data URL.
 * Resizes large camera photos to a max of 1600px width/height and compresses,
 * ensuring fast loading times while keeping stunning visual clarity.
 */
export async function optimizeImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Downscale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        // Draw image with high quality smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Try WebP first for optimal compression
        try {
          const webpData = canvas.toDataURL('image/webp', quality)
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData)
            return
          }
        } catch {
          // WebP not supported by browser, fall back to JPEG
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality)
        resolve(jpegData)
      }
      img.onerror = () => reject(new Error('Failed to load image for processing'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads a base64 data URL to Cloud Storage (via /api/upload endpoint or Supabase Storage).
 * If the cloud upload succeeds, returns the permanent HTTPS CDN URL.
 * If all cloud endpoints are completely unreachable, returns the dataUrl as safe fallback.
 */
export async function uploadDataUrlToCloud(
  dataUrl: string,
  folder = 'homepage',
  filename?: string
): Promise<string> {
  // If already an HTTP/HTTPS or local path, no need to upload
  if (!dataUrl || (!dataUrl.startsWith('data:') && !dataUrl.startsWith('blob:'))) {
    return dataUrl
  }

  // If it's a blob: URL, convert to base64 dataUrl first
  let payloadDataUrl = dataUrl
  if (dataUrl.startsWith('blob:')) {
    try {
      const resp = await fetch(dataUrl)
      const blob = await resp.blob()
      payloadDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (e) {
      console.warn('Could not read blob URL:', e)
    }
  }

  // 1. Try /api/upload endpoint first (works on Vercel and local dev server)
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData?.session?.access_token
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dataUrl: payloadDataUrl,
        folder,
        filename,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.url) {
        return data.url
      }
    }
  } catch (apiErr) {
    console.warn('/api/upload request failed, trying client storage fallback:', apiErr)
  }

  // 2. Client-side Supabase storage fallback
  try {
    const cleanFileName = `${Date.now()}-${filename ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg'}`
    const filePath = `${folder}/${cleanFileName}`

    const response = await fetch(payloadDataUrl)
    const blob = await response.blob()

    const { error: uploadError } = await supabase.storage
      .from('auditorium-photos')
      .upload(filePath, blob, {
        upsert: true,
        contentType: blob.type || 'image/jpeg',
      })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('auditorium-photos')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        return urlData.publicUrl
      }
    }
  } catch (storageErr) {
    console.warn('Client storage upload failed:', storageErr)
  }

  // Return optimized data URL fallback if offline
  return payloadDataUrl
}

/**
 * Attempts to upload an image to Supabase Storage if the bucket is configured.
 * Optimizes the image locally first to ensure quick uploads and low bandwidth,
 * then uploads to Supabase Storage and returns the permanent CDN URL.
 */
export async function uploadOrConvertPhoto(
  file: File,
  folder = 'venues'
): Promise<string> {
  // Always optimize locally first
  const optimizedDataUrl = await optimizeImageFile(file)

  // Upload to cloud storage
  return uploadDataUrlToCloud(optimizedDataUrl, folder, file.name)
}

/**
 * Batch upload / convert multiple image files
 */
export async function uploadOrConvertMultiplePhotos(
  files: FileList | File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const fileArray = Array.from(files)
  const results: string[] = []

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]
    const url = await uploadOrConvertPhoto(file)
    results.push(url)
    if (onProgress) {
      onProgress(i + 1, fileArray.length)
    }
  }

  return results
}

