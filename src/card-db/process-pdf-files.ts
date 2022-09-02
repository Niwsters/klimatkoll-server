import fs from 'fs'
import { spawn } from 'child_process'
import { sleep } from './sleep'
import { Location } from './location'

async function pageCount(pdfFile: string, location: Location): Promise<number> {
  return new Promise((resolve, reject) => {
    const process = spawn('sh', ['./pdf-page-count.sh', location.pdfFile(pdfFile)], { shell: true })
    process.stdout.on('data', (data: Buffer) => resolve(parseInt(data.toString())))
    process.stderr.on('data', (data: Buffer) => reject(data.toString()))
  })
}

async function pdf2svg(
  pdfFile: string,
  svgFile: string,
  pageNumber: number,
  location: Location
): Promise<null> {
  return new Promise((resolve, reject) => {
    const process = spawn('pdf2svg', [
      location.pdfFile(pdfFile),
      location.svgFile(svgFile),
      `${pageNumber}`
    ], { shell: true })
    process.on('exit', resolve)
    process.stderr.on('data', data => reject(data.toString()))
  })
}

function svgFileName(pdfFile: string, pageNumber: number): string {
  return pdfFile.replace(/.pdf$/, '') + `-${pageNumber}.svg`
}

async function processPDFFile(pdfFile: string, location: Location) {
  const count = await pageCount(pdfFile, location)
  for (let page=1; page<count; page++) {
    console.log(`PDF PROCESSING: Processing page: ${page}`)
    try {
      await pdf2svg(pdfFile, svgFileName(pdfFile, page), page, location)
    } catch (e) {
      console.log(`WARNING: pdf2svg emitted error:`, e)
    }
  }
  fs.rmSync(location.pdfFile(pdfFile))
}

async function processPDFFiles(location: Location) {
  const files = fs.readdirSync(location.pdfFolder)
  for (const file of files) {
    console.log(`PDF PROCESSING: Processing PDF file: ${file}`)
    await processPDFFile(file, location)
  }
}

export async function startProcessingPDFFiles(location: Location) {
  while (true) {
    try {
      await processPDFFiles(location)
      await sleep(1000)
    } catch (e) {
      console.log(e)
    }
  }
}
