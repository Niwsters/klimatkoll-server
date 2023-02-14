const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

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

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function allSubdirs(folder) {
  const all = fs.readdirSync(folder, { withFileTypes: true }).filter(file => file.name !== "node_modules")
  const files = all.filter(file => !file.isDirectory()).map(file => path.join(folder, file.name))
  const folders = all.filter(file => file.isDirectory()).map(file => path.join(folder, file.name))
  return flatten([...files, ...folders.map(allSubdirs)])
}

function watch(root) {
  let compiling = false

  const watchFile = folder => {
    fs.watch(folder, async (_eventType, _filename) => {
      if (!compiling) {
        compiling = true
        await build()
        compiling = false
      }
    })
  }

  for (const folder of allSubdirs(root)) {
    watchFile('./' + folder)
  }
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

  const folders = ["packages/game/src", "packages/card-db/src", "packages/client/src", "packages/dev-server"]
  for (const folder of folders) {
    watch(folder)
  }

  run()
}

start().catch(console.log)
