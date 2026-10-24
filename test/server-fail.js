import { ok, rejects } from 'node:assert'
import tehanu from 'tehanu'
import { startServer } from '../src/index.js'

const test = tehanu(import.meta.filename)

test('fails on a port already taken', async () =>
  rejects(async () => {
    let server
    try {
      ;({ server } = await startServer({ host: 'localhost' }, undefined, false))
      await startServer({ host: 'localhost' }, undefined, false)
    } finally {
      ok(server)
      await server.close()
      await new Promise(resolve => setTimeout(resolve, 4000))
    }
  }))
