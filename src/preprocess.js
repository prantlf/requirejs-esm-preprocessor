import { transform } from 'requirejs-esm'
import { resolvePath as defaultResolvePath } from './resolve-path'

const cwd = process.cwd()

function shortenPath(path) {
  return path.startsWith(cwd) ? path.substring(cwd.length) : path
}

export default function preprocess({
  path,
  contents,
  dirMap,
  appDir,
  needsResolve,
  resolvePath = false,
  useStrict = true,
  onBeforeTransform,
  onAfterTransform,
  onBeforeUpdate,
  onAfterUpdate,
  sourceMap = true,
  verbose,
  silent
}) {
  if (appDir && path.startsWith(appDir)) path = path.substring(appDir.length + 1)
  if (dirMap) resolvePath = (sourcePath, currentFile) => defaultResolvePath(sourcePath, currentFile, { dirMap, needsResolve })
  const start = performance.now()
  try {
    const { code, updated } = transform(contents, path, {
      useStrict,
      sourceMap,
      resolvePath,
      onBeforeTransform,
      onAfterTransform,
      onBeforeUpdate,
      onAfterUpdate
    })
    if (verbose) {
      const duration = (performance.now() - start).toFixed(3)
      console.log(`${updated ? 'Transformed' : 'Skipped'} "${shortenPath(path)}" in ${duration}ms...`)
    }
    return code
  } catch (err) {
    if (!silent) {
      console.warn(`Transforming "${shortenPath(path)}" failed:`)
      console.warn(err)
    }
    return contents
  }
}
