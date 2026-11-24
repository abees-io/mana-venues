import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

/**
 * Cloud Image Upload Serverless Endpoint:
 * - Accepts base64 dataUrl (or buffer) and target folder
 * - Uses Supabase Service Role client to bypass RLS policies
 * - Uploads to public bucket 'auditorium-photos'
 * - Returns clean, permanent public CDN URL
 */
export default async function handler(req, res) {
  // Enable CORS if requested
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { dataUrl, folder = 'homepage', filename } = req.body || {}

    if (!dataUrl) {
      return res.status(400).json({ error: 'Missing dataUrl in request body' })
    }

    // Parse mime type and base64 buffer
    let buffer
    let contentType = 'image/jpeg'
    let extension = 'jpg'

    const matches = dataUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/)
    if (matches && matches.length === 3) {
      contentType = matches[1]
      buffer = Buffer.from(matches[2], 'base64')
      if (contentType.includes('webp')) extension = 'webp'
      else if (contentType.includes('png')) extension = 'png'
      else if (contentType.includes('gif')) extension = 'gif'
      else extension = 'jpg'
    } else {
      return res.status(400).json({ error: 'Invalid dataUrl format. Expected base64 data URL.' })
    }

    // Clean filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const baseName = filename
      ? filename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '')
      : `photo-${timestamp}`
    const cleanFilePath = `${folder}/${timestamp}-${baseName}-${randomSuffix}.${extension}`

    // Upload using Supabase Service Role client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('auditorium-photos')
      .upload(cleanFilePath, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      return res.status(500).json({ error: uploadError.message })
    }

    // Retrieve public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('auditorium-photos')
      .getPublicUrl(cleanFilePath)

    if (!urlData?.publicUrl) {
      return res.status(500).json({ error: 'Could not obtain public URL for uploaded file' })
    }

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path: cleanFilePath,
    })
  } catch (err) {
    console.error('Upload API internal error:', err)
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown upload error',
    })
  }
}
