const { serve } = require('..')
serve({
  isScript: path => path.endsWith('.js') && path.startsWith('/demo-local/src/')
})
