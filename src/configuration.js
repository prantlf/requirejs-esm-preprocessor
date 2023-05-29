export function defaultUsage (name, {
  server = true, port = process.env.PORT || 8967,
  secureServer = true, securePort = process.env.SECURE_PORT || 9876,
  host = process.env.HOST || '0.0.0.0', root = '.',
  errorsOnly = true, servedOnly = true, transforms = false, silent = false,
  extraOptions = '', extraExamples = ''
} = {}) {
  console.log(`Launches a development web server.

Usage: ${name} [option...]

Options:
  -I|--no-insecure           disable the HTTP listener  (default: ${server})
  -p|--port <number>         HTTP port to listen to     (default: ${port})
  -S|--no-secure             disable the HTTPS listener (default: ${secureServer})
  -s|--secure-port <number>  HTTPS port to listen to    (default: ${securePort})
  -h|--host <name>           host to bind the port to   (default: "${host}")
  -r|--root <path>           root directory to serve    (default: "${root}")
  -e|--[no-]log-errors       log failed requests        (default: ${!silent})
  -u|--[no-]log-successes    log successful requests    (default: ${!errorsOnly})
  -c|--[no-]log-cached       log cached and redirects   (default: ${!servedOnly})
  -t|--[no-]log-transforms   log transformations        (default: ${transforms})
  -V|--version               print version number
  -H|--help                  print usage instructions
${extraOptions}
Examples:
  ${name} -p 80 --no-secure
  ${name} -u
${extraExamples}`)
}

export function defaultUnknownArg(arg) {
  console.error(`Unknown argument: "${arg}".`)
}

export function configure(args, name, version, options = {}) {
  let {
    server, port, secureServer, securePort, host, root,
    errorsOnly = true, servedOnly = true, transforms, silent,
    usage = defaultUsage, unknownArg = defaultUnknownArg
  } = options

  for (let i = 0, l = args.length; i < l; ++i) {
    const arg = args[i]
    const match = /^(?:-|--)(no-)?([a-zA-Z][-a-z]*)$/.exec(arg)
    if (match) {
      const flag = match[1] !== 'no-'
      switch (match[2]) {
        case 'I': case 'insecure':
          server = false
          continue
        case 'p': case 'port':
          port = +args[++i]
          continue
        case 'S': case 'secure':
          secureServer = false
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
          usage(name, options)
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
