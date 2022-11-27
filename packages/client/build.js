import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  watch: false,
  outfile: '../../dist/packages/client/bundle.js',
  minify: true
})
.catch(reason => {
  console.log(reason)
  process.exit()
})
