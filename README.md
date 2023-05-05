# ESM to AMD Preprocessor for RequireJS

[![Latest version](https://img.shields.io/npm/v/requirejs-esm-preprocessor)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/requirejs-esm-preprocessor)
](https://www.npmjs.com/package/requirejs-esm-preprocessor)

A preprocessor of JavaScript modules in [RequireJS] projects converting ESM to AMD. It takes care only of the module format; it does not transpile the language and that is why it is [a lot faster] than plugins using [Babel]. If you need to transpile the code to an earlier ECMAScript version, have a look at [requirejs-babel7].

A file preprocessor is a lot less intrusive than a RequireJS plugin. However, it requires a pluggable development web server, so that a plugin (compatible with [connect middleware]) can be registered in it. The production web server has not limitations, because the bundled output of [RequireJS optimizer] contains AMD modules. (Preprocessing takes place in the `onBuildRead` callback.) Have look at [requirejs-esm] if you are looking for a RequireJS plugin withtou these limitations.

The official [RequireJS optimizer] (`r.js`) does not wire up source maps from the original (not transpiled) sources to the source map of the output bundle. It makes this or similar preprocessors unfeasible for serious work. If you want the proper support for source maps, replace the official optimizer package ([`requirejs`]) with the forked [`@prantlf/requirejs`], which is fixed.

## Installation

This module can be installed in your project using [NPM], [PNPM] or [Yarn]. Make sure, that you use [Node.js] version 14 or newer.

```sh
npm i -D requirejs-esm-preprocessor
pnpm i -D requirejs-esm-preprocessor
yarn add requirejs-esm-preprocessor
```

## Usage

Add the following property to the build configuration file for the RequireJS optimizer:

```js
{
  onBuildRead: (moduleName, path, contents) => {
    const { preprocess } = nodeRequire('requirejs-esm-preprocessor')
    return preprocess({ path: moduleName, contents })
  }
}
```

Create a file `server.js` to be used as the development web server:

```js
const { serve } = require('requirejs-esm-preprocessor')
serve({
  // Transform local sources; not require.js loaded on the page from node_modules
  isScript: path => path.endsWith('.js') && path.startsWith('/src/')
})
```

If your project contains source scripts ending with `.js`, which should be transpiled, and all other scripts loaded on pages by `script` elements end with `.min.js`, you can use the ready-to-use command line server:

    requirejs-esm-serve

You can use the ESM module format in modules loaded as dependencies by RequireJS. The main application script cannot be an ESM module, because it would be wrapped in a `define` statement. The main application script i ssupposed to include a `require` statement to perform the application initialisation.

This plugin transpiles only ESM source files. If it detects a statement calling functions `define`, `require` or `require.config` on the root level of the source file, it will return the text of the source file as-is.

See also a [demo-local] project, which includes sources only from the local `src` directory:

```sh
npm run start:local
open http://localhost:8967/demo-local/normal.html
open http://localhost:8967/demo-local/optimized.html
```

## Advanced

You can bundle ESM modules from outside of your source root too. For example:

```js
import { html, render } from 'lit-html/lit-html'
render(html`<p>Hello, world!<p>`, document.body)
```

Let `lit-html` be a path alias in the RequireJS configuration pointing to a directory among NPM dependencies outside the source root:

```js
paths: {
  'lit-html': '../node_modules/lit-html'
},
```

However, the relative paths of model dependencies outside the source root will be based on the source root, instead on the module path outside of the source root. One way how to deal with this problem is resolving the relative module paths manually by trimming the directories from absolute module paths:

```js
{
  onBuildRead: (moduleName, path, contents) => {
    const { preprocess } = nodeRequire('requirejs-esm-preprocessor')
    const cwd = process.cwd()
    // Base all modules from local sources on the source root
    const appDir = `${cwd}/src`
    // Remove the root of external modules; expect the external
    // module directories in the RequireJS `paths` configuration
    const dirMap = { [`${cwd}/node_modules/`]: '' }
    return preprocess({ path, contents, appDir, dirMap })
  }
}
```

If you want to merge the NPM dependencies bundled in your project with the other outside of your project, you can rebase their root, so that they would appear next to with other external static assets in the browser debugger:

```js
{
  onModuleBundleComplete: ({ path }) => {
    const { rebaseMapFile } = nodeRequire('requirejs-esm-preprocessor')
    rebaseMapFile(`${path}.map`, { [`${process.cwd()}/node_modules/`]: '../node_modules/' });
  }
}
```

The development web server must not transform static assets that are not meant to be bundled in the optimised output:

```js
const { serve } = require('requirejs-esm-preprocessor')
serve({
  isScript: path => path.endsWith('.js') &&
    !path => path.endsWith('.min.js') &&
    !path.endsWith('/require.js'),
  dirMap: { '/node_modules/': '' }
})
```

See also a [demo-extern] project, which includes sources from the local `src` directory and from `node_modules` outside of it:

```sh
npm run start:extern
open http://localhost:8967/demo-extern/normal.html
open http://localhost:8967/demo-extern/optimized.html
```

## API

```ts
interface DirMap {
  [ key: string ]: string
}

type NeedsResolve = (sourcePath: string, currentFile: string) => boolean

interface ResolveOptions {
  dirMap?: DirMap
  needsResolve?: NeedsResolve
}

resolvePath(sourcePath: string, currentFile: string, options?: ResolveOptions): string

rebasePath(path: string, dirMap?: DirMap): string
rebaseMap(map: object, dirMap?: DirMap): void
rebaseMapFile(file: string, dirMap?: DirMap): void

type ResolvePath = ((sourcePath: string, currentFile: string, options?: ResolveOptions) => string) | false
type IsScript = (path: string) => boolean

preprocess(options?: {
  path: string, contents: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath = false,
  sourceMap?: boolean = true, verbose?: boolean, silent?: boolean }): string

type Handler = (req: http.OutgoingMessage, res: http.IncomingMessage, next: () => void) => void

serveFile(req: http.OutgoingMessage, res: http.IncomingMessage, path: string) :void
serveScript(req: http.OutgoingMessage, res: http.IncomingMessage, options?: {
  path: string, fullPath: string, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath = false,
  sourceMap?: boolean = true, verbose?: boolean, silent?: boolean }): void
preprocessor(options?: {
  root?: string = '.', scriptsOnly?: boolean, fallthrough?: boolean,
  setHeaders?: (res: http.Response, path: string, stat: fs.Stat) => void,
  cache?: boolean, isScript?: IsScript, dirMap?: DirMap, appDir?: string,
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath = false,
  sourceMap?: boolean = true, verbose?: boolean, silent?: boolean }): Handler

interface ServerOptions {
  root?: string = '.', isScript?: IsScript, scriptsOnly?: boolean
  host: string = process.env.HOST || '0.0.0.0'
  port: number = process.env.PORT || 8967
  dirMap?: DirMap, appDir?: string, sourceMap?: boolean = true
  needsResolve?: NeedsResolve, resolvePath?: ResolvePath = false
  secureOptions?: {
    port: number = process.env.SECURE_PORT || 9876
    key?: string | Blob | Buffer = 'dist/certificates/localhost.key'
    cert?: string | Blob | Buffer = 'dist/certificates/localhost.crt'
    allowHTTP1?: boolean = true
  }
  logOptions?: {
    format?: string = 'dev', errorsOnly?: boolean = true
    servedOnly?: boolean = true, transforms?: boolean, silent?: boolean
  }
  favicon?: boolean
}

defaultUsage(): void
defaultUnknownArg(arg: string): boolean
configure(options: {
  args: string[], version: string,
  usage?: () => void, unknownArg?: (arg: string) => boolean
}): {
  server?: boolean, secureServer?: boolean, root?: string,
  host?: string, port?: number, secureOptions?: { port: number },
  errorsOnly: boolean, servedOnly: boolean,
  transforms?: boolean, silent?: boolean
}

createHandler(options?: ServerOptions): Handler
createServer(options?: ServerOptions, handler?: Handler): http.Server
createSecureServer(options?: ServerOptions, handler?: Handler): Promise<http.Server>
startServer(options?: ServerOptions,
  server?: http.Server | false, secureServer?: http.Server | false,
  handler?: Handler) : Promise<{ server?: http.Server, secureServer?: http.Server }>
serve(options?: ServerOptions): void
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2022-2023 Ferdinand Prantl

Licensed under the MIT license.

[Babel]: https://babeljs.io/
[RequireJS]: http://requirejs.org
[RequireJS optimizer]: https://requirejs.org/docs/optimization.html
[requirejs-babel7]: https://www.npmjs.com/package/requirejs-babel7
[requirejs-esm]: https://www.npmjs.com/package/requirejs-esm
[`requirejs`]: https://www.npmjs.com/package/requirejs
[`@prantlf/requirejs`]: https://www.npmjs.com/package/@prantlf/requirejs
[Node.js]: http://nodejs.org/
[NPM]: https://www.npmjs.com/
[PNPM]: https://pnpm.io/
[Yarn]: https://yarnpkg.com/
[demo-local]: https://github.com/prantlf/requirejs-esm-preprocessor/tree/master/demo-local
[demo-extern]: https://github.com/prantlf/requirejs-esm-preprocessor/tree/master/demo-extern
[default module name resolution]: https://github.com/prantlf/requirejs-esm-preprocessor/blob/master/src/resolve-path.js#L4
[resolvePath]: https://github.com/tleunen/babel-plugin-module-resolver/blob/master/DOCS.md#resolvepath
[a lot faster]: https://github.com/prantlf/requirejs-esm/tree/master/perf/README.md#readme
[connect middleware]: https://github.com/senchalabs/connect/wiki
