export function defaultUsage (name) {
  console.log(`Launches a development web server.

Usage: ${name} [option...]

Options:
  -I|--[no-]insecure         enable the HTTP listener  (default: true)
  -p|--port <number>         HTTP port to listen to    (default: 7777)
  -S|--[no-]secure           enable the HTTPS listener (default: true)
  -s|--secure-port <number>  HTTPS port to listen to   (default: 9999)
  -h|--host <name>           host to bind the port to  (default: "0.0.0.0")
  -r|--root <path>           root directory to serve   (default: ".")
  -e|--[no-]log-errors       log failed requests       (default: true)
  -u|--[no-]log-successes    log successful requests   (default: false)
  -c|--[no-]log-cached       log cached and redirects  (default: false)
  -t|--[no-]log-transforms   log transformations       (default: false)
  -V|--version               print version number
  -H|--help                  print usage instructions

Examples:
  ${name} -p 8888 --no-secure
  ${name} --no-u
`)
}

export function defaultUnknownArg(arg) {
  console.error(`Unknown argument: "${arg}".`)
}

export function configure(args, name, version, { usage = defaultUsage, unknownArg = defaultUnknownArg } = {}) {
  let server, port, secureServer, securePort, host, root,
      errorsOnly = true, servedOnly = true, transforms, silent

  for (let i = 0, l = args.length; i < l; ++i) {
    const arg = args[i]
    const match = /^(?:-|--)(no-)?([a-zA-Z][-a-z]*)$/.exec(arg)
    if (match) {
      const flag = match[1] !== 'no-'
      switch (match[2]) {
        case 'I': case 'insecure':
          server = flag ? undefined : false
          continue
        case 'p': case 'port':
          port = +args[++i]
          continue
        case 'S': case 'secure':
          secureServer = flag ? undefined : false
          continue
        case 's': case 'secure-port':
          securePort = +args[++i]
          continue
        case 'h': case 'host':
          host = args[++i]
          continue
        case 'r': case 'root':
          root = args[++i]
          continue
        case 'e': case 'log-errors':
          silent = !flag
          continue
        case 'u': case 'log-successes':
          errorsOnly = !flag
          continue
        case 'c': case 'log-cached':
          servedOnly = !flag
          continue
        case 't': case 'log-transforms':
          transforms = flag
          continue
        case 'V': case 'version':
          console.log(version)
          process.exit(0)
          break
        case 'H': case 'help':
          usage(name)
          process.exit(0)
      }
    }
    if (!unknownArg(arg)) process.exit(1)
  }

  return {
    host, root, server, port, secureServer,
    secureOptions: securePort ? { port: securePort } : undefined,
    errorsOnly, servedOnly, transforms, silent
  }
}
