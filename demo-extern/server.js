const { serve } = require('..')
serve({
  isScript: path => path.endsWith('.js') &&
    (path.startsWith('/demo-extern/src/') || path.startsWith('/node_modules/')) &&
    !(path.endsWith('/require.js') || path.endsWith('/require.min.js')),
  dirMap: {
    '/node_modules/': '',
    '/demo-extern/src/': 'src/'
  }
})
