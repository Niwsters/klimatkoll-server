const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['./src/client/index.ts'],
  bundle: true,
  outfile: './dist/client.js',
  minify: false
})
.catch(reason => {
  console.log(reason)
  process.exit()
})
