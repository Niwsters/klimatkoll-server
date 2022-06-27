import fs from 'fs'
import { spawn } from 'child_process'

async function pageCount(pdfFile: string): Promise<number> {
  return new Promise(resolve => {
    const process = spawn('sh', ['./pdf-page-count.sh', `./pdf/${pdfFile}`], { shell: true })
    process.stdout.on('data', (data: Buffer) => resolve(parseInt(data.toString())))
  })
}

async function pdf2svg(
  pdfFile: string,
  svgFile: string,
  pageNumber: number
): Promise<null> {
  return new Promise(resolve => {
    const process = spawn('pdf2svg', [
      `./pdf/${pdfFile}`,
      `./svg/${svgFile}`,
      `${pageNumber}`
    ], { shell: true })
    process.on('exit', resolve)
  })
}

function svgFileName(pdfFile: string, pageNumber: number): string {
  return pdfFile.replace(/.pdf$/, '') + `-${pageNumber}.svg`
}

async function processPDFFile(pdfFile: string) {
  const count = await pageCount(pdfFile)
  for (let page=1; page<count; page++) {
    await pdf2svg(pdfFile, svgFileName(pdfFile, page), page)
  }
  fs.rmSync(`./pdf/${pdfFile}`)
}

async function processPDFFiles() {
  const files = fs.readdirSync('./pdf')
  for (const file of files) {
    await processPDFFile(file)
  }
}

async function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

export async function startProcessingPDFFiles() {
  while (true) {
    await processPDFFiles()
    await sleep(1000)
  }
}
