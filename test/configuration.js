const { strictEqual, deepStrictEqual } = require('assert')
const test = require('tehanu')(__filename)
const { configure, defaultUsage, defaultUnknownArg } = require('../dist/cjs')

test('returns default options', () => {
  const {
    host, root, server, port, secureServer, secureOptions,
    errorsOnly, servedOnly, transforms, silent
  } = configure([])
  strictEqual(host, undefined)
  strictEqual(root, undefined)
  strictEqual(server, undefined)
  strictEqual(port, undefined)
  strictEqual(secureServer, undefined)
  strictEqual(secureOptions, undefined)
  strictEqual(errorsOnly, true)
  strictEqual(servedOnly, true)
  strictEqual(transforms, undefined)
  strictEqual(silent, undefined)
})

test('returns requested options', () => {
  const {
    host, root, server, port, secureServer, secureOptions,
    errorsOnly, servedOnly, transforms, silent
  } = configure([
    '-h', 'host', '-r', 'root', '-no-I', '-p', '80', '-no-S', '-s', '443',
    '-no-e', '-no-u', '-c', '-t'
  ])
  strictEqual(host, 'host')
  strictEqual(root, 'root')
  strictEqual(server, false)
  strictEqual(port, 80)
  strictEqual(secureServer, false)
  deepStrictEqual(secureOptions, { port: 443 })
  strictEqual(errorsOnly, true)
  strictEqual(servedOnly, false)
  strictEqual(transforms, true)
  strictEqual(silent, true)
})

test('prints usage', () => defaultUsage('usage-test'))

test('logs an unknown argument', () => defaultUnknownArg('arg'))
