const { serve } = require('..')
serve({
  isScript: path => path.endsWith('.js') && !path.endsWith('.min.js') &&
    (path.startsWith('/demo-extern/src/') || path.startsWith('/node_modules/')) &&
    !(path.endsWith('/require.js')),
  dirMap: {
    '/node_modules/': '',
    '/demo-extern/src/': 'src/'
  }
})
