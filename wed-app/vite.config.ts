import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url === '/api/upload' || req.url.startsWith('/api/upload?'))) {
          if (req.method === 'POST') {
            try {
              const chunks: Buffer[] = []
              req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
              req.on('end', async () => {
                try {
                  const bodyStr = Buffer.concat(chunks).toString('utf-8')
                  const body = bodyStr ? JSON.parse(bodyStr) : {}
                  // @ts-ignore
                  const { default: handler } = await import('./api/upload/index.js')
                  const mockReq = { method: req.method, body }
                  const mockRes = {
                    statusCode: 200,
                    setHeader(k: string, v: string) { res.setHeader(k, v) },
                    status(code: number) { res.statusCode = code; return this },
                    json(data: any) {
                      res.setHeader('Content-Type', 'application/json')
                      res.end(JSON.stringify(data))
                      return this
                    },
                    end() { res.end() }
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
              next()
            }
          } else if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
  server: {
    port: 5000,
  },
})

