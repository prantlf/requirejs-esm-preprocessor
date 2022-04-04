import { dirname, normalize } from 'path'
import { rebasePath } from './rebase-map'

export function resolvePath(sourcePath, currentFile, { dirMap, needsResolve } = {}) {
  if (sourcePath.includes('!') || sourcePath === 'require' ||
      sourcePath === 'module' || sourcePath === 'exports') return sourcePath

  if ((sourcePath.charAt(0) === '.' && (sourcePath.charAt(1) === '/' ||
       sourcePath.charAt(1) === '.' && sourcePath.charAt(2) === '/')) &&
      (!needsResolve || needsResolve(sourcePath, currentFile))) {
    if (dirMap) currentFile = rebasePath(currentFile, dirMap)
    sourcePath = normalize(`${dirname(currentFile)}/${sourcePath}`)
    if (sourcePath.endsWith('.js')) sourcePath = sourcePath.substring(0, sourcePath.length - 3)
  }

  return sourcePath
}
