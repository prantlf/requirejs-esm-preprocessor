({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  paths: {
    'lit-html': '../node_modules/lit-html'
  },

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  onBuildRead: (moduleName, path, contents) => {
    const cwd = process.cwd()
    const { preprocess } = nodeRequire(cwd)
    const appDir = `${cwd}/demo-extern`
    const dirMap = { [`${cwd}/node_modules/`]: '' }
    return preprocess({ path, contents, appDir, dirMap, verbose: true })
  },

  onModuleBundleComplete: ({ path }) => {
    const cwd = process.cwd()
    const { rebaseMapFile } = nodeRequire(cwd)
    rebaseMapFile(`${path}.map`, { [`${cwd}/node_modules/`]: '../node_modules/' });
  }
})
