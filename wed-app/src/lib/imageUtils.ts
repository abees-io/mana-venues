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
 * Attempts to upload an image to Supabase Storage if the bucket is configured.
 * If storage upload fails or bucket doesn't exist, seamlessly falls back to
 * the client-side optimized image data URL so venue creation never fails.
 */
export async function uploadOrConvertPhoto(
  file: File,
  folder = 'venues'
): Promise<string> {
  // Always optimize locally first
  const optimizedDataUrl = await optimizeImageFile(file)

  try {
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${folder}/${cleanFileName}`

    // Convert data URL to Blob for upload
    const response = await fetch(optimizedDataUrl)
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
  } catch (err) {
    console.warn('Storage upload fallback triggered:', err)
  }

  // Return optimized data URL fallback
  return optimizedDataUrl
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

