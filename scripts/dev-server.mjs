#!/usr/bin/env node
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.ogg', 'audio/ogg'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.wasm', 'application/wasm'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
])

const args = process.argv.slice(2)

function readOption(name) {
  const index = args.indexOf(name)
  return index === -1 ? null : args[index + 1] ?? null
}

const port = Number(readOption('--port') ?? process.env.PORT ?? 8080)
const host = readOption('--host') ?? process.env.HOST ?? '127.0.0.1'

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(`Invalid port: ${port}. Use a number between 0 and 65535.`)
  process.exit(1)
}

function sendError(res, status, message) {
  const body = `${status} ${message}\n`
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function resolveRequestPath(urlPath) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    return null
  }

  if (decoded.includes('\0')) return null

  const normalized = path.posix.normalize(decoded)
  const relative = normalized.replace(/^\/+/, '')
  const filePath = path.resolve(root, relative)

  if (filePath !== root && !filePath.startsWith(root + path.sep)) return null
  return filePath
}

async function findFile(filePath) {
  try {
    const info = await stat(filePath)
    if (info.isFile()) return { filePath, size: info.size }
    if (!info.isDirectory()) return null

    const indexPath = path.join(filePath, 'index.html')
    const indexInfo = await stat(indexPath)
    return indexInfo.isFile() ? { filePath: indexPath, size: indexInfo.size } : null
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    sendError(res, 405, 'Method Not Allowed')
    return
  }

  let url
  try {
    url = new URL(req.url, 'http://localhost')
  } catch {
    sendError(res, 400, 'Bad Request')
    return
  }

  const filePath = resolveRequestPath(url.pathname)
  if (!filePath) {
    sendError(res, 400, 'Bad Request')
    return
  }

  const found = await findFile(filePath)
  if (!found) {
    sendError(res, 404, 'Not Found')
    return
  }

  const ext = path.extname(found.filePath).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME_TYPES.get(ext) ?? 'application/octet-stream',
    'Content-Length': found.size,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  const stream = createReadStream(found.filePath)
  stream.on('error', (error) => {
    console.error(`Failed to read ${found.filePath}:`, error)
    res.destroy(error)
  })
  stream.pipe(res)
})

server.on('clientError', (error, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: npm run dev -- --port 8081`)
  } else {
    console.error('Dev server failed:', error)
  }
  process.exitCode = 1
})

server.listen(port, host, () => {
  const actualPort = server.address().port
  const displayHost = host === '0.0.0.0' || host === '::' ? 'localhost' : host
  console.log('Silhouette Samurai dev server')
  console.log(`  Local:   http://${displayHost}:${actualPort}/`)
  console.log(`  Serving: ${root}`)
  console.log('  Stop:    Ctrl+C')
})
