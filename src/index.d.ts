import http from 'http'

interface DirMap {
  [ key: string ]: string
}

type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  dirMap?: DirMap
  needsResolve?: NeedsResolve
}

interface AmdOptions {
  namespace?: Record<string, unknown>
  func: Record<string, unknown>
  name: string
  deps?: string[]
  params?: string[]
  factory?: Record<string, unknown>
  output?: Record<string, unknown>
}

declare function resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

declare function rebasePath(path: string, dirMap?: DirMap): string
declare function rebaseMap(map: object, dirMap?: DirMap): void
declare function rebaseMapFile(file: string, dirMap?: DirMap): void

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false
type OnBeforeTransform = (options: OnBeforeTransformOptions) => void
type OnAfterTransform = (options: OnAfterTransformOptions) => void
type OnBeforeUpdate = (options: AmdOptions) => boolean
type OnAfterUpdate = (options: AmdOptions) => boolean
type IsScript = (path: string) => boolean

declare function preprocess(options?: {
  path: string, contents: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  useStrict?: boolean /*= true*/, sourceMap?: boolean /*= true */,
  onBeforeTransform?: OnBeforeTransform, onAfterTransform?: OnAfterTransform,
  onBeforeUpdate?: OnBeforeUpdate, onAfterUpdate?: OnAfterUpdate,
  verbose?: boolean, silent?: boolean }): string

type Handler = (req: http.OutgoingMessage, res: http.IncomingMessage, next: () => void) => void

declare function serveFile(req: http.OutgoingMessage, res: http.IncomingMessage, options: string | {
  fallthrough?: boolean, cache?: boolean,
  setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void
}) :void
declare function serveScript(req: http.OutgoingMessage, res: http.IncomingMessage, options?: {
  fallthrough?: boolean, cache?: boolean,
  setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void,
  path: string, fullPath: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  useStrict?: boolean /*= true*/, sourceMap?: boolean /*= true */,
  onBeforeTransform?: OnBeforeTransform, onAfterTransform?: OnAfterTransform,
  onBeforeUpdate?: OnBeforeUpdate, onAfterUpdate?: OnAfterUpdate,
  verbose?: boolean, silent?: boolean }): void
declare function preprocessor(options?: {
  root?: string /*= '.' */, scriptsOnly?: boolean, fallthrough?: boolean,
  setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void,
  cache?: boolean, isScript?: IsScript, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath /*= false */,
  useStrict?: boolean /*= true*/, sourceMap?: boolean /*= true */,
  onBeforeTransform?: OnBeforeTransform, onAfterTransform?: OnAfterTransform,
  onBeforeUpdate?: OnBeforeUpdate, onAfterUpdate?: OnAfterUpdate,
  verbose?: boolean, silent?: boolean }): Handler

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
  useStrict?: boolean /*= true*/
  sourceMap?: boolean /*= true */
  needsResolve?: NeedsResolve
  resolvePath?: ResolvePath /*= false */
  onBeforeTransform?: OnBeforeTransform
  onAfterTransform?: OnAfterTransform
  onBeforeUpdate?: OnBeforeUpdate
  onAfterUpdate?: OnAfterUpdate
  needsResolve?: NeedsResolve
  secureOptions?: SecureOptions
  logOptions?: LogOptions
  leadingHandlers?: Handler[]
  middleHandlers?: Handler[]
  trailingHandlers?: Handler[]
  favicon?: boolean
  server?: http.Server | false
  secureServer?: http.Server | false
  handler?: Handler
}

interface OnBeforeTransformOptions extends ServerOptions {
  program: Record<string, unknown>
}

interface OnAfterTransformOptions extends OnBeforeTransformOptions {
  callbackBody: Record<string, unknown>[]
}

declare function createHandler(options?: ServerOptions): Handler
declare function createServer(options?: ServerOptions, handler?: Handler): http.Server
declare function createSecureServer(options?: ServerOptions, handler?: Handler): Promise<http.Server>
declare function startServer(options?: ServerOptions,
  server?: http.Server | false, secureServer?: http.Server | false,
  handler?: Handler) : Promise<{ server?: http.Server, secureServer?: http.Server }>
declare function serve(options?: ServerOptions): void
