import esbuild from 'esbuild'
import { execSync } from 'child_process'
import { onFileChange } from './file-watcher.js'

function build() {
  esbuild.buildSync({
    entryPoints: ['./src/tests/tests.ts'],
    bundle: true,
    outfile: './dist-tests/tests.js',
    sourcemap: true,
    platform: 'node'
  })
}

function executeTests() {
  try {
    build()
    execSync('node --enable-source-maps ./dist-tests/tests.js', { stdio: 'inherit' })
  } catch (e) {
    console.log(e.trace)
  }
}

function run() {
  console.time('Ran all tests in')
  console.clear()
  executeTests()
  console.timeEnd('Ran all tests in')
}

run()
onFileChange(() => {
  run()
})
