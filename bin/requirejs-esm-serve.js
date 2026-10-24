#!/usr/bin/env node

import packageJson from '../package.json' with { type: 'json' }
import { configure, serve } from '../src/index.js'

serve(configure(process.argv.slice(2), 'requirejs-esm-serve', packageJson.version))
