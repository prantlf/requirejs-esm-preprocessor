const { readFile } = require('fs/promises')
const protocols = { http: require('http'), https: require('http') }
const { ok, equal } = require('assert')
const test = require('tehanu')(__filename)
const { createServer, createSecureServer, startServer } = require('../dist/cjs')

let server, secureServer
test.before(async () => ({ server, secureServer } = await startServer({ host: 'localhost' })))
test.after(async () => {
  await server.close()
  await secureServer.close()
})

function request(path, { method = 'GET', protocol = 'http', headers } = {}) {
  return new Promise((resolve, reject) =>
    protocols[protocol].request({
      method, path, headers,
      hostname: 'localhost',
      port: 8967
    }, res => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ res, data }))
    })
    .on('error', reject)
    .end())
}

test('creates a default handler', async () => {
  const server = createServer()
  ok(!('secureOptions' in server), 'insecure')
  const secureServer = await createSecureServer()
  ok('secureOptions' in secureServer, 'secure')
})

test('fails for an unsupported method', async () => {
  const { res } = await request('/LICENSE', { method: 'POST' })
  equal(res.statusCode, 405)
})

test('fails for an unsupported method for a script', async () => {
  const { res } = await request('/demo-local/src/index.js', { method: 'POST' })
  equal(res.statusCode, 405)
})

test('fails for an missing file', async () => {
  const { res } = await request('/dummy')
  equal(res.statusCode, 404)
})

test('serves a directory index', async () => {
  const { res, data } = await request('/')
  equal(res.statusCode, 200)
  ok(data.length > 0, 'not empty')
})

test('inspects a plain file', async () => {
  const { res, data } = await request('/LICENSE', { method: 'HEAD' })
  equal(res.statusCode, 200)
  equal(data, '')
})

test('serves a plain file', async () => {
  const expected = await readFile('LICENSE', 'utf8')
  const { res, data } = await request('/LICENSE?test', { protocol: 'https' })
  equal(res.statusCode, 200)
  equal(data, expected)
})

test('serves a part of a file', async () => {
  const { res, data } = await request('/LICENSE', { headers: { range: 'bytes=0-2' } })
  equal(res.statusCode, 206)
  equal(data, 'MIT')
})

test('serves a part of a script', async () => {
  const { res, data } = await request('/demo-local/src/index.js', { headers: { range: 'bytes=0-6' } })
  equal(res.statusCode, 206)
  equal(data, 'require')
})

test('serves the last part of a file', async () => {
  const { res, data } = await request('/LICENSE', { headers: { range: 'bytes=1068' } })
  equal(res.statusCode, 206)
  equal(data, 'SOFTWARE.\n')
})

test('fails for an invalid range', async () => {
  const { res } = await request('/LICENSE', { headers: { range: 'bytes=1078' } })
  equal(res.statusCode, 416)
})

test('fails for an invalid range of a script', async () => {
  const { res } = await request('/demo-local/src/index.js', { headers: { range: 'bytes=1000' } })
  equal(res.statusCode, 416)
})

test('recognises the same content', async () => {
  const { res: cache } = await request('/LICENSE')
  const { 'last-modified': date } = cache.headers
  const { res } = await request('/LICENSE', { headers: { 'if-modified-since': date }})
  equal(res.statusCode, 304)
})

test('serves an ESM script', async () => {
  const { res, data } = await request('/demo-local/src/sum.js')
  equal(res.statusCode, 200)
  equal(data, `define(function () {
  "use strict";
  return (a, b) => a + b;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9kZW1vLWxvY2FsL3NyYy9zdW0uanMiXSwibmFtZXMiOlsiYSIsImIiXSwibWFwcGluZ3MiOiI7O1NBQWUsQ0FBQ0EsR0FBR0MsTUFBTUQsSUFBSUMiLCJmaWxlIjoiL2RlbW8tbG9jYWwvc3JjL3N1bS5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IChhLCBiKSA9PiBhICsgYlxuIl19`)
})

test('serves an AMD script', async () => {
  const expected = await readFile('demo-local/src/index.js', 'utf8')
  const { res, data } = await request('/demo-local/src/index.js')
  equal(res.statusCode, 200)
  equal(data, expected)
})

test('recognises the same script', async () => {
  const { res: cache } = await request('/demo-local/src/index.js')
  const { 'last-modified': date } = cache.headers
  const { res } = await request('/demo-local/src/index.js', { headers: { 'if-modified-since': date }})
  equal(res.statusCode, 304)
})
