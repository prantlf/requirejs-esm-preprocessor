const { readFile } = require('fs/promises')
const http = require('http')
const http2 = require('http2')
const fastify = require('fastify')
const middie = require('middie')
const morgan = require('morgan')
const cors = require('cors')
const serveIndex = require('serve-index')
const useTransformer = require('./transformer')

async function createHandler(options) {
  const {
    root = '.',
    logOptions = {},
    scriptExceptions = [],
    serverFactory
  } = options
  const {
    format = 'dev',
    errorsOnly = true,
    servedOnly = true
  } = logOptions
  const handler = fastify({ serverFactory })
  await handler.register(middie)
  handler.use(morgan(format, {
      skip: (req, { statusCode }) => errorsOnly && statusCode < 400 ||
        servedOnly && statusCode >= 300 && statusCode < 400
    }))
    .use(cors())
    .use(serveIndex(root))
    .use(useTransformer({ root, exceptions: scriptExceptions }))
  return handler
}

async function startServer(options = {}) {
  const {
    host = process.env.HOST || '0.0.0.0',
    port = +(process.env.PORT || 7777),
    secureOptions = {}
  } = options
  let {
    port: securePort = +(process.env.SECURE_PORT || 9999),
    key = `${__dirname}/certificates/localhost.key`,
    cert = `${__dirname}/certificates/localhost.crt`,
    allowHTTP1 = true
  } = secureOptions
  const browserHost = host === '0.0.0.0' ? 'localhost' : host

  if (typeof key === 'string') key = await readFile(key)
  if (typeof cert === 'string') cert = await readFile(cert)

  return new Promise((resolve, reject) => {
    let succeeded = 0
    const succeed = msg => {
      console.log(msg)
      if (++succeeded === 2) resolve()
    }
    const fail = err => {
      console.error(err)
      succeeded = NaN
      reject(err)
    }

    createHandler({
      ...options,
      serverFactory: handler => http.createServer(handler).on('error', fail)
    })
    .then(handler => handler.listen({ port, host }, () =>
      succeed(`Listening at http://${browserHost}:${port}...`)))
    .catch(fail)

    createHandler({
      ...options,
      serverFactory: handler => http2.createSecureServer({
        key, cert, allowHTTP1,
        ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
        honorCipherOrder: true,
        secureProtocol: 'TLSv1_2_method'
       }, handler)
      .on('error', fail)
    })
    .then(handler => handler.listen({ port: securePort, host }, () =>
      succeed(`Listening at https://${browserHost}:${securePort}...`)))
    .catch(fail)
  })
}

module.exports = { createHandler, startServer }
