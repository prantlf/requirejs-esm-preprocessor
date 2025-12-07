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

function inferStatus(err) {
  /* c8 ignore next 4 */
  if (err.code === 'ENOENT') return 404
  console.error(err)
  return 500
}

function serveError(req, res, code, text) {
  if (code instanceof Error) code = inferStatus(code)
  res.writeHead(code, { 'content-type': 'text/plain' })
  res.end(text || STATUS_CODES[code])
}

async function checkStats(req, res, path, cache) {
  const stats = await stat(path)
  const { mtime: modified } = stats
  const cached = req.headers['if-modified-since']
  modified.setMilliseconds(0)
  if (cache === false || !cached || new Date(cached) < modified) {
    return stats.isFile() ? stats : { next: true }
  }
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
  const end = part1 ? +part1 : size - 1
  if (start < 0 || start >= size || end < 0 || end < start || end >= size) {
    return {}
  }
  size = end - start + 1
  return {
    start, end,
    rangeHeaders: {
      'content-length': size,
      'content-range': `bytes ${start}-${end - 1}/${size}`
    }
  }
}

function serveHeaders(req, res, path, size, stats, setHeaders) {
  const { mtime } = stats
  const headers = createHeaders(path, mtime)
  const { range } = req.headers
  if (range) {
    const { start, end, rangeHeaders } = createRange(size, range)
    if (!end) {
      serveError(req, res, 416)
      return { failed: true }
    }
    setHeaders && setHeaders(res, path, stats)
    res.writeHead(206, { ...rangeHeaders, ...headers })
    return { start, end }
  }
  setHeaders && setHeaders(res, path, stats)
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

export async function serveFile(req, res, options) {
  /* c8 ignore next */
  if (typeof options === 'string') options = { fullPath: options }
  const { fullPath, cache, setHeaders } = options
  const stats = await checkStats(req, res, fullPath, cache)
  const { mtime, size, next } = stats
  if (!(mtime && checkMethod(req, res, fullPath, mtime, size))) return { next }
  const { start, end, failed } = serveHeaders(req, res, fullPath, size, stats, setHeaders)
  if (!failed) {
    const stream = end ? createReadStream(fullPath, { start, end }) : createReadStream(fullPath)
    stream.pipe(res)
  }
}

export async function serveScript(req, res, {
  cache, setHeaders, path, fullPath, resolvePath, dirMap, appDir,
  needsResolve, useStrict, sourceMap, verbose, silent,
  onBeforeTransform, onAfterTransform, onBeforeUpdate, onAfterUpdate
}) {
  const stats = await checkStats(req, res, fullPath, cache)
  const { mtime } = stats
  if (!mtime) return
  const contents = await readFile(fullPath, 'utf8')
  const code = preprocess({
    path, contents, resolvePath, dirMap, appDir,
    needsResolve, useStrict, sourceMap, verbose, silent,
    onBeforeTransform, onAfterTransform, onBeforeUpdate, onAfterUpdate
  })
  const bytes = Buffer.from(code)
  const { length } = bytes
  if (!checkMethod(req, res, path, mtime, length)) return
  const { start, end, failed } = serveHeaders(req, res, path, length, stats, setHeaders)
  if (!failed) res.end(end ? bytes.subarray(start, end + 1) : bytes)
}

function endsWithJS(path) {
  return path.endsWith('.js') && !path.endsWith('.min.js')
}

export function preprocessor({
  root = '.', isScript = endsWithJS, scriptsOnly, fallthrough, cache, setHeaders,
  resolvePath, dirMap, appDir, needsResolve, useStrict, sourceMap, verbose, silent,
  onBeforeTransform, onAfterTransform, onBeforeUpdate, onAfterUpdate
} = {}) {
  return async function (req, res, next) {
    const path = cutQuery(req.url)
    const fullPath = join(root, path)
    try {
      let out
      if (isScript(path)) {
        out = await serveScript(req, res, {
          cache, setHeaders, path, fullPath, resolvePath, dirMap, appDir,
          needsResolve, useStrict, sourceMap, verbose, silent,
          onBeforeTransform, onAfterTransform, onBeforeUpdate, onAfterUpdate
        })
      } else if (!scriptsOnly) {
        out = await serveFile(req, res, { cache, setHeaders, fullPath })
      } else {
        return next()
      }
      if (out && out.next) next()
    } catch (err) {
      if (fallthrough) {
        next()
      } else if (fallthrough === false) {
        if (typeof err.code === 'string') err.code = inferStatus(err)
        next(err)
      } else {
        serveError(req, res, err)
      }
    }
  }
}
