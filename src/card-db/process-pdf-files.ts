import fs from 'fs'
import { spawn } from 'child_process'
import { sleep } from './sleep'

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
  return new Promise((resolve, reject) => {
    const process = spawn('pdf2svg', [
      `./pdf/${pdfFile}`,
      `./svg/${svgFile}`,
      `${pageNumber}`
    ], { shell: true })
    process.on('exit', resolve)
    process.stderr.on('data', data => reject(data.toString()))
  })
}

function svgFileName(pdfFile: string, pageNumber: number): string {
  return pdfFile.replace(/.pdf$/, '') + `-${pageNumber}.svg`
}

async function processPDFFile(pdfFile: string) {
  const count = await pageCount(pdfFile)
  for (let page=1; page<count; page++) {
    console.log(page)
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

export async function startProcessingPDFFiles() {
  while (true) {
    try {
      await processPDFFiles()
      await sleep(1000)
    } catch (e) {
      console.log(e)
    }
  }
}
