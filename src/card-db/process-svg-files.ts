import { sleep } from "./sleep";
import fs from 'fs'
import { spawn } from 'child_process'

// inkscape $1 --export-filename="$2" -w $3

async function exec(cmd: string) {
  return new Promise(resolve => {
    const split = cmd.split(' ')
    const process = spawn(split[0], split.slice(1), { shell: true })
    process.on('exit', resolve,)
  })
}

async function svg2png(svgFile: string, pngFile: string, width: number) {
  await exec(`inkscape ${svgFile} --export-filename="${pngFile}" -w ${width}`)
}

function svgPath(svgFile: string): string {
  return `./svg/${svgFile}`
}

function pngFile(svgFile: string): string {
  return svgFile.replace(/\.svg$/, '.png')
}

function pngPath(svgFile: string): string {
  return `./png/${pngFile(svgFile)}`
}

async function processSVGFiles() {
  for (const file of fs.readdirSync('./svg')) {
    await svg2png(svgPath(file), pngPath(file), 1024)
    fs.rmSync(svgPath(file))
  }
}

export async function startProcessingSVGFiles() {
  while (true) {
    await processSVGFiles()
    await sleep(1000)
  }
}
