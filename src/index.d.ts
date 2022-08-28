import http from 'http'

interface DirMap {
  [ key: string ]: string
}

type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  dirMap?: DirMap
  needsResolve?: NeedsResolve
}

declare function resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

declare function rebasePath(path: string, dirMap?: DirMap): string
declare function rebaseMap(map: object, dirMap?: DirMap): void
declare function rebaseMapFile(file: string, dirMap?: DirMap): void

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false
type IsScript = (path: string) => boolean

declare function preprocess(options?: {
  path: string, contents: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  sourceMap?: boolean /*= true */, verbose?: boolean, silent?: boolean }): string

type Handler = (req: http.OutgoingMessage, res: http.IncomingMessage, next: () => void) => void

declare function serveFile(req: http.OutgoingMessage, res: http.IncomingMessage, options: string | {
  fallthrough?: boolean, setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void
}) :void
declare function serveScript(req: http.OutgoingMessage, res: http.IncomingMessage, options?: {
  fallthrough?: boolean, setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void,
  path: string, fullPath: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  sourceMap?: boolean /*= true */, verbose?: boolean, silent?: boolean }): void
declare function preprocessor(options?: {
  root?: string /*= '.' */, scriptsOnly?: boolean, fallthrough?: boolean,
  setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void,
  isScript?: IsScript, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  sourceMap?: boolean /*= true */, verbose?: boolean, silent?: boolean }): Handler

interface BaseOptions {
  root?: string /*= '.' */
  host?: string /*= process.env.HOST || '0.0.0.0' */
  port?: number /*= process.env.PORT || 8967 */
  server?: boolean /*= true */
  secureServer?: boolean /*= true */
}

interface BaseLogOptions {
  errorsOnly?: boolean /*= true */
  servedOnly?: boolean /*= true */
  transforms?: boolean
  silent?: boolean
}

interface BaseConfigureOptions extends BaseOptions, BaseLogOptions {}

interface UsageOptions extends BaseConfigureOptions {
  securePort?: number /*= process.env.SECURE_PORT || 9876 */
  extraOptions?: string /*= '' */
  extraExamples?: string /*= '' */
}

interface ConfigureOptions extends UsageOptions {
  usage?: () => void
  unknownArg?: (arg: string) => boolean
}

interface ConfigureResult extends BaseConfigureOptions {
  secureOptions?: { port: number }
}

declare function defaultUsage(name: string, options?: UsageOptions): void
declare function defaultUnknownArg(arg: string): boolean
declare function configure(args: string[], name: string, version: string,
  options?: ConfigureOptions): ConfigureResult

interface LogOptions extends BaseLogOptions {
  format?: string /*= 'dev' */
}

interface SecureOptions {
  port: number /*= process.env.SECURE_PORT || 9876 */
  key?: string | Blob | Buffer /*= 'dist/certificates/localhost.key' */
  cert?: string | Blob | Buffer /*= 'dist/certificates/localhost.crt' */
  allowHTTP1?: boolean /*= true */
}

interface ServerOptions extends BaseOptions {
  isScript?: IsScript
  scriptsOnly?: boolean
  dirMap?: DirMap
  appDir?: string
  sourceMap?: boolean /*= true */
  needsResolve?: NeedsResolve
  resolvePath?: ResolvePath /*= false */
  secureOptions?: SecureOptions
  logOptions?: LogOptions
  favicon?: boolean
}

declare function createHandler(options?: ServerOptions): Handler
declare function createServer(options?: ServerOptions, handler?: Handler): http.Server
declare function createSecureServer(options?: ServerOptions, handler?: Handler): Promise<http.Server>
declare function startServer(options?: ServerOptions,
  server?: http.Server | false, secureServer?: http.Server | false,
  handler?: Handler) : Promise<{ server?: http.Server, secureServer?: http.Server }>
declare function serve(options?: ServerOptions): void
