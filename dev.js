const child_process = require('child_process')
const fs = require('fs')

async function exec(command) {
  return new Promise((resolve, reject) => {
    child_process.exec(command, (err, _stdout) => {
      if (err) reject()
      resolve()
    })
  })
}

async function build() {
  console.log("Compiling...")
  await exec("npm run build")
  console.log("Finished compiling")
}


function watch(folder) {
  let compiling = false
  fs.watch(folder, async (_eventType, _filename) => {
    console.log(_eventType, _filename)
    if (!compiling) {
      compiling = true
      await build()
      compiling = false
    }
  })
}

function cleanExit() {
  process.exit()
}

async function run() {
  console.log("Running server")
  const child = child_process.spawn("npm", ["start", "-w", "@klimatkoll/dev-server"], { stdio: "inherit" })
  process.on("exit", cleanExit)
  process.on('SIGINT', cleanExit); // catch ctrl-c
  process.on('SIGTERM', cleanExit); // catch kill
}

async function start() {
  console.log("Started build script")
  await build()
  watch("./packages/game/src")
  run()
}

start()
