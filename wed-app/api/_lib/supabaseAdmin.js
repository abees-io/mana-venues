import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Auto-load .env.local in local dev environments if process.env is not populated
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VITE_SUPABASE_URL) {
  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), 'wed-app', '.env.local'),
      path.resolve(process.cwd(), '..', '.env.local'),
    ]
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8')
        content.split('\n').forEach((line) => {
          const match = line.match(/^([^=]+)=(.*)$/)
          if (match) {
            const key = match[1].trim()
            const val = match[2].trim().replace(/^['"]|['"]$/g, '')
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        })
        break
      }
    }
  } catch {
    // ignore in environments without filesystem access
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Warning: Missing Supabase server credentials. Check environment variables.')
}

/**
 * Server-side Supabase client using Service Role key to bypass RLS for administrative tasks
 * (such as background iCal sync cron, hold expirations, Razorpay webhook updates, and media uploads).
 */
export const supabaseAdmin = createClient(
  (supabaseUrl || 'https://efhmmsprizhptpecllrh.supabase.co').replace(/\/$/, ''),
  serviceRoleKey || 'anon'
)

