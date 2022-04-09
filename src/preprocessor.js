import { createReadStream } from 'fs'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { STATUS_CODES } from 'http'
import { getType } from 'mime'
import preprocess from './preprocess'

function cutQuery(url) {
  const questionMark = url.indexOf('?')
  return questionMark > 0 ? url.substring(0, questionMark) : url
}

function serveError(req, res, code, text) {
  if (code instanceof Error) {
    if (code.code === 'ENOENT') {
      code = 404
    } else {
      console.error(code)
      code = 500
    }
  }
  res.writeHead(code, { 'content-type': 'text/plain' })
  res.end(text || STATUS_CODES[code])
}

async function checkStats(req, res, path) {
  const stats = await stat(path)
  const { mtime: modified } = stats
  const cached = req.headers['if-modified-since']
  modified.setMilliseconds(0)
  if (!cached || new Date(cached) < modified) return stats
  res.writeHead(304)
  res.end()
  return {}
}

function createHeaders(path, mtime) {
  const now = new Date()
  return {
    'accept-ranges': 'bytes',
    'last-modified': mtime.toUTCString(),
    'date': now.toUTCString(),
    'expires': new Date(now.getTime() + 5000).toUTCString(),
    'cache-control': 'public, max-age=5',
    'content-type': getType(path) || 'application/octet-stream'
  }
}

function createRange(size, range) {
  const [part0, part1] = range.replace(/bytes=/, '').split('-')
  const start = +part0
  const end = part1 ? +part1 : size
  size = end - start + 1
  return {
    start, end,
    rangeHeaders: {
      'content-length': size,
      'content-range': `bytes ${start}-${end - 1}/${size}`
    }
  }
}

function serveHeaders(req, res, path, mtime, size) {
  const headers = createHeaders(path, mtime)
  const { range } = req.headers
  if (range) {
    const { start, end, rangeHeaders } = createRange(size, range)
    res.writeHead(206, { ...rangeHeaders, ...headers })
    return { start, end }
  }
  res.writeHead(200, { 'content-length': size, ...headers })
  return {}
}

function serveInfo(req, res, path, mtime, size) {
  const headers = createHeaders(path, mtime)
  res.writeHead(200, { 'content-length': size, ...headers })
  res.end()
}

function checkMethod(req, res, path, mtime, size) {
  const { method } = req
  if (method === 'GET') return true
  if (method === 'HEAD') serveInfo(req, res, path, mtime, size)
  else serveError(req, res, 405)
}

export async function serveFile(req, res, path) {
  const { mtime, size } = await checkStats(req, res, path)
  if (!(mtime && checkMethod(req, res, path, mtime, size))) return
  const { start, end } = serveHeaders(req, res, path, mtime, size)
  const stream = end ?
    createReadStream(path, { start, end }) : createReadStream(path)
  stream.pipe(res)
}

export async function serveScript(req, res, { path, fullPath, resolvePath, dirMap, appDir, needsResolve, sourceMap, verbose, silent }) {
  const { mtime } = await checkStats(req, res, fullPath)
  if (!mtime) return
  const contents = await readFile(fullPath, 'utf8')
  const code = preprocess({ path, contents, resolvePath, dirMap, appDir, needsResolve, sourceMap, verbose, silent })
  const bytes = Buffer.from(code)
  const { length } = bytes
  if (!checkMethod(req, res, path, mtime, length)) return
  const { start, end } = serveHeaders(req, res, path, mtime, length)
  res.end(end ? bytes.subarray(start, end) : bytes)
}

function endsWithJS(path) {
  return path.endsWith('.js') && !path.endsWith('.min.js')
}

export function preprocessor({ root = '.', isScript = endsWithJS, scriptsOnly, resolvePath, dirMap, appDir, needsResolve, sourceMap, verbose, silent } = {}) {
  return function (req, res, next) {
    const path = cutQuery(req.url)
    const fullPath = join(root, path)
    const promise = isScript(path) && serveScript(req, res, { path, fullPath, resolvePath, dirMap, appDir, needsResolve, sourceMap, verbose, silent })
      || !scriptsOnly && serveFile(req, res, fullPath)
    if (promise) promise.catch(err => serveError(req, res, err))
    else next()
  }
}
