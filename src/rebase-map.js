import { readFileSync, writeFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'

export function rebasePath(path, dirMap) {
  for (const source in dirMap) {
    if (path.startsWith(source)) return `${dirMap[source]}${path.substring(source.length)}`
  }
  return path
}

export function rebaseMap(map, dirMap) {
  map.sources = map.sources.map(path => rebasePath(path, dirMap))
}

export function rebaseMapFile(file, dirMap) {
  const mapContent = readFileSync(file, 'utf8')
  const map = JSON.parse(mapContent)
  rebaseMap(map, dirMap)
  writeFileSync(file, JSON.stringify(map))
}

export async function rebaseMapFileAsync(file, dirMap) {
  const mapContent = await readFile(file, 'utf8')
  const map = JSON.parse(mapContent)
  rebaseMap(map, dirMap)
  await writeFile(file, JSON.stringify(map))
}
