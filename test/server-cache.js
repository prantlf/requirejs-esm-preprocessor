const http = require('http')
const polka = require('polka')
const { equal } = require('assert')
const test = require('tehanu')(__filename)
const { preprocessor, startServer } = require('../dist/cjs')

let server
test.before(async () => {
  const { handler } = polka()
    .use(preprocessor({ fallthrough: false, cache: false }))
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
  const { res, data } = await request('/dummy')
  equal(res.statusCode, 404)
  equal(data, 'ENOENT: no such file or directory, stat \'dummy\'')
})

test('sends the same content once more', async () => {
  const { res: cache } = await request('/LICENSE')
  const { 'last-modified': date } = cache.headers
  const { res } = await request('/LICENSE', { headers: { 'if-modified-since': date }})
  equal(res.statusCode, 200)
})
