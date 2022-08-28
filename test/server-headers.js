const http = require('http')
const polka = require('polka')
const { ok, equal } = require('assert')
const test = require('tehanu')(__filename)
const { preprocessor, startServer } = require('../dist/cjs')

const setHeaders = (res, path, stats) => {
  res.setHeader('X-Test', '1')
  equal(path, 'LICENSE')
  equal(typeof stats, 'object')
  ok(stats)
}

let server
test.before(async () => {
  const { handler } = polka()
    .use(preprocessor({ fallthrough: true, setHeaders }))
    .use((req, res) => {
      res.writeHead(201)
      res.end('test')
    });
  ({ server } = await startServer({}, null, false, handler))
})
test.after(() => server.close())

function request(path, { method = 'GET', headers } = {}) {
  return new Promise((resolve, reject) =>
    http.request({
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

test('fails through for an missing file', async () => {
  const { res } = await request('/dummy')
  equal(res.statusCode, 201)
})

test('lets additional headers be set', async () => {
  const { res } = await request('/LICENSE')
  equal(res.statusCode, 200)
  equal(res.headers['x-test'], '1')
})

test('serves a part of a file with extra headers', async () => {
  const { res } = await request('/LICENSE', { headers: { range: 'bytes=0-2' } })
  equal(res.statusCode, 206)
  equal(res.headers['x-test'], '1')
})
