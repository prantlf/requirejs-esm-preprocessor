import { nodeResolve } from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/index.js',
  output: [{ file: 'dist/index.cjs', format: 'cjs', sourcemap: true }],
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    copy({
      targets: [
        { src: 'src/index.d.ts', dest: 'dist', rename: 'esm.d.ts' },
        { src: ['src/certificates/*.key', 'src/certificates/*.crt'], dest: 'dist/certificates' }
      ]
    })
  ],
  external: [
    'connect-block-favicon',
    'cors',
    'node:fs/promises',
    'mime',
    'morgan',
    'polka',
    'requirejs-esm',
    'serve-index'
  ]
}
