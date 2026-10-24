import { equal } from 'node:assert'
import http from 'node:http'
import polka from 'polka'
import tehanu from 'tehanu'
import { preprocessor, startServer } from '../src/index.js'

const test = tehanu(import.meta.filename)

let server
test.before(async () => {
  const { handler } = polka()
    .use(preprocessor({ scriptsOnly: true }))
    .use((_req, res) => {
      res.writeHead(201)
      res.end('test')
    })
  ;({ server } = await startServer({ host: 'localhost' }, null, false, handler))
})
test.after(() => server.close())

function request(path, { method = 'GET', headers } = {}) {
  return new Promise((resolve, reject) =>
    http
      .request(
        {
          method,
          path,
          headers,
          hostname: 'localhost',
          port: 8967
        },
        res => {
          let data = ''
          res.setEncoding('utf8')
          res.on('data', chunk => (data += chunk))
          res.on('end', () => resolve({ res, data }))
        }
      )
      .on('error', reject)
      .end()
  )
}

test('serves an AMD script', async () => {
  const { res } = await request('/demo-local/src/index.js')
  equal(res.statusCode, 200)
})

test('lets a non-script be processed by further handlers', async () => {
  const { res } = await request('/dummy')
  equal(res.statusCode, 201)
})
