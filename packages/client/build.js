import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  outfile: './dist/bundle.js',
  minify: false
})
.catch(reason => {
  console.log(reason)
  process.exit()
})
