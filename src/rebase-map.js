const { readFileSync, writeFileSync } = require('fs')

export function rebasePath(path, dirMap) {
  for (const source in dirMap) {
    if (path.startsWith(source))
      return `${dirMap[source]}${path.substring(source.length)}`
  }
  return path
}

export function rebaseMap(map, dirMap) {
  map.sources = map.sources.map(path => {
    for (const source in dirMap) {
      if (path.startsWith(source))
        return `${dirMap[source]}${path.substring(source.length)}`
    }
    return path
  })
}

export function rebaseMapFile(file, dirMap) {
  const map = JSON.parse(readFileSync(file, 'utf8'))
  rebaseMap(map, dirMap)
  writeFileSync(file, JSON.stringify(map))
}
