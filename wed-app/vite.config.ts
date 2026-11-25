import react from '@vitejs/plugin-react'
import path from 'path'
import { pathToFileURL } from 'url'
import { defineConfig, type Plugin } from 'vite'

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next()
        }

        const parsedUrl = new URL(req.url, 'http://localhost:5000')
        const pathname = parsedUrl.pathname
        const query: Record<string, string> = {}
        parsedUrl.searchParams.forEach((v, k) => {
          query[k] = v
        })

        let handlerPath: string | null = null
        if (pathname === '/api/upload') {
          handlerPath = 'api/upload/index.js'
        } else if (pathname === '/api/bookings/initiate') {
          handlerPath = 'api/bookings/initiate/index.js'
        } else if (pathname === '/api/sync-ical') {
          handlerPath = 'api/sync-ical/index.js'
        } else if (pathname === '/api/webhooks/razorpay') {
          handlerPath = 'api/webhooks/razorpay/index.js'
        } else if (pathname.startsWith('/api/calendar/')) {
          handlerPath = 'api/calendar/[vendorId].js'
          query.vendorId = pathname.replace('/api/calendar/', '')
        }

        if (!handlerPath) {
          return next()
        }

        try {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
          req.on('end', async () => {
            try {
              const bodyStr = Buffer.concat(chunks).toString('utf-8')
              const body = bodyStr ? JSON.parse(bodyStr) : {}
              const absHandlerUrl = pathToFileURL(path.resolve(server.config.root, handlerPath!)).href
              // @ts-ignore
              const { default: handler } = await import(absHandlerUrl)
              const mockReq = {
                method: req.method,
                headers: req.headers,
                query,
                body,
              }
              const mockRes = {
                statusCode: 200,
                setHeader(k: string, v: string) { res.setHeader(k, v) },
                status(code: number) { res.statusCode = code; return this },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                  return this
                },
                send(data: any) {
                  res.end(typeof data === 'string' ? data : JSON.stringify(data))
                  return this
                },
                end() { res.end() },
              }
              await handler(mockReq, mockRes)
            } catch (err: any) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err?.message || 'Dev API Error' }))
            }
          })
          return
        } catch {
          return next()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  server: {
    port: 5000,
  },
})

