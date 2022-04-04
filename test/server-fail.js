const { rejects } = require('assert')
const test = require('tehanu')(__filename)
const { startServer } = require('../dist/cjs')

test('fails on a port already taken', async () => {
  rejects(async () => {
    let server
    try {
      ({ server } = await startServer({ host: 'localhost' }, undefined, false))
      await startServer({ host: 'localhost' }, undefined, false)
    } finally {
      server && server.close()
    }
  })
})
