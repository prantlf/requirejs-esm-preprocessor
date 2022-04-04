({
  baseUrl: './',

  name: 'src/index',
  out: 'main-built.js',

  optimize: 'none',
  generateSourceMaps: true,
  preserveLicenseComments: false,

  onBuildRead: (moduleName, path, contents) => {
    const { preprocess } = nodeRequire(process.cwd())
    return preprocess({ path: moduleName, contents })
  }
})
