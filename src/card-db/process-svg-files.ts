import { sleep } from "./sleep";
import fs from 'fs'
import svgexport from 'svgexport'

async function svg2png(svgFile: string, pngFile: string, width: number) {
  //await exec(`inkscape ${svgFile} -o "${pngFile}" -w ${width}`)
  return new Promise(resolve => {
    svgexport.render({
      input: [svgFile],
      output: [[pngFile, '100%', `${width}:${width*1.5}`]]
    }, resolve)
  })
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
