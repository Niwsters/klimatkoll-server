import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['./game-server.ts'],
  bundle: true,
  watch: false,
  outfile: '../../dist/packages/game/bundle.js',
  minify: true,
  target: ['node16.13.1'],
  platform: 'node'
})
.catch(reason => {
  console.log(reason)
  process.exit()
})
