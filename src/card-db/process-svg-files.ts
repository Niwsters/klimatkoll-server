import { sleep } from "./sleep";
import fs from 'fs'
import svgexport from 'svgexport'
import { Location } from './location'

async function svg2png(svgFile: string, pngFile: string, width: number) {
  return new Promise(resolve => {
    svgexport.render({
      input: [svgFile],
      output: [[pngFile, '100%', `${width}:${width*1.5}`]]
    }, resolve)
  })
}

function pngFile(svgFile: string): string {
  return svgFile.replace(/\.svg$/, '.png')
}

async function processSVGFiles(location: Location) {
  for (const svgFile of fs.readdirSync('./svg')) {
    await svg2png(location.svgFile(svgFile), location.pngFile(pngFile(svgFile)), 1024)
    fs.rmSync(location.svgFile(svgFile))
  }
}

export async function startProcessingSVGFiles(location: Location) {
  while (true) {
    await processSVGFiles(location)
    await sleep(1000)
  }
}
