const child_process = require('child_process')
const fs = require('fs')

async function exec(command) {
  return new Promise((resolve, _reject) => {
    child_process.exec(command, (err, stdout) => {
      if (err) resolve(err)
      resolve(stdout)
    }, { stdio: "inherit" })
  })
}

async function build() {
  console.log("Compiling...")
  console.log(await exec("npm run build"))
  console.log("Finished compiling")
}


function watch(folder) {
  let compiling = false
  fs.watch(folder, async (_eventType, _filename) => {
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

// Fix child processes not exiting cleanly on CTRL+C
process.on("exit", cleanExit)
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

async function run() {
  console.log("Starting server")
  child_process.spawn("npm", ["start", "-w", "@klimatkoll/dev-server"], { stdio: "inherit" })
}

async function start() {
  console.log("Started build script")
  await build()

  const folders = ["./packages/game/src", "./packages/card-db/src", "./packages/client/src", "./packages/dev-server"]
  for (const folder of folders) {
    watch(folder)
  }

  run()
}

start()
