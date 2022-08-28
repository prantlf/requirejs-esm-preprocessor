import { readFile } from 'fs/promises'
import http from 'http'
import http2 from 'http2'
import polka from 'polka'
import morgan from 'morgan'
import cors from 'cors'
import serveIndex from 'serve-index'
import blockFavicon from 'connect-block-favicon'
import { preprocessor } from './preprocessor'

export function createHandler(options = {}) {
  const {
    root = '.', isScript, scriptsOnly, fallthrough, setHeaders, resolvePath,
    dirMap, appDir, needsResolve, sourceMap, logOptions = {}, favicon
  } = options
  const {
    format = 'dev', errorsOnly = true, servedOnly = true, transforms, silent
  } = logOptions
  const server = polka()
    .use(morgan(format, {
      skip: (req, { statusCode }) => silent || errorsOnly && statusCode < 400 ||
        servedOnly && statusCode >= 300 && statusCode < 400
    }))
    .use(cors())
  if (!favicon) server.use(blockFavicon())
  return server
    .use(preprocessor({
      root, isScript, scriptsOnly, fallthrough, setHeaders, resolvePath,
      dirMap, appDir, needsResolve, sourceMap, verbose: transforms, silent
    }))
    .use(serveIndex(root))
    .handler
}

export function createServer(options = {}, handler) {
  return http.createServer(handler || createHandler(options))
}

export async function createSecureServer(options = {}, handler) {
  const {
    secureOptions = {}
  } = options
  let {
    key = `${__dirname}/certificates/localhost.key`,
    cert = `${__dirname}/certificates/localhost.crt`,
    allowHTTP1 = true
  } = secureOptions

  if (typeof key === 'string') key = await readFile(key)
  if (typeof cert === 'string') cert = await readFile(cert)

  return http2.createSecureServer({
    key, cert, allowHTTP1,
    ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  }, handler || createHandler(options))
}

export async function startServer(options = {}, server, secureServer, handler) {
  const {
    host = process.env.HOST || '0.0.0.0', port = +(process.env.PORT || 8967),
    secureOptions = {}, logOptions = {}
  } = options
  const {
    silent
  } = logOptions
  let {
    port: securePort = +(process.env.SECURE_PORT || 9876)
  } = secureOptions
  const browserHost = host === '0.0.0.0' ? 'localhost' : host

  if (!handler) handler = createHandler(options)

  let successCount = 1
  if (!server && server !== false) {
    server = createServer(options, handler)
    ++successCount
  }
  if (!secureServer && secureServer !== false) {
    secureServer = await createSecureServer(options, handler)
    ++successCount
  }

  return new Promise((resolve, reject) => {
    let succeeded = 0
    const succeed = msg => {
      if (msg && !silent) console.log(msg)
      if (++succeeded === successCount) resolve({ server, secureServer })
    }
    const fail = err => {
      if (!silent) console.error(err)
      succeeded = NaN
      reject(err)
    }

    if (server)
      server.on('error', fail).listen(port, host, () =>
        succeed(`Listening at http://${browserHost}:${port}...`))

    if (secureServer)
      secureServer.on('error', fail).listen(securePort, host, () =>
        succeed(`Listening at https://${browserHost}:${securePort}...`))

    succeed()
  })
}

/* c8 ignore next 3 */
export function serve(options) {
  startServer(options).catch(err => console.error(err))
}
