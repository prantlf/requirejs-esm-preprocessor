#!/usr/bin/env node

const { configure, serve } = require('../dist/cjs')
const { version } = require('../package.json')

serve(configure(process.argv.slice(2), 'requirejs-esm-serve', version))
