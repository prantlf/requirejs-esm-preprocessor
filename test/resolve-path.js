import { equal } from 'node:assert'
import tehanu from 'tehanu'
import { resolvePath } from '../src/index.js'

const test = tehanu(import.meta.filename)

test('ignores special RequireJS modules', () => {
  equal(resolvePath('require', ''), 'require')
  equal(resolvePath('module', ''), 'module')
  equal(resolvePath('exports', ''), 'exports')
})

test('ignores dependencies using plugins', () =>
  equal(resolvePath('text!test.txt', ''), 'text!test.txt'))

test('resolves a relative path', () => equal(resolvePath('../second', 'parent/first'), 'second'))

test('leaves a path intact is requested', () =>
  equal(
    resolvePath('./second', 'parent/first', {
      needsResolve: sourcePath => sourcePath !== './second'
    }),
    './second'
  ))
