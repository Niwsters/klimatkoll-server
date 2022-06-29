import http from 'http'
import express, { Request, Response } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import uniqid from 'uniqid'
import fs from 'fs'
import { startProcessingPDFFiles } from './process-pdf-files'
import { startProcessingSVGFiles } from './process-svg-files'
import { routes } from './routes'
import { spawn } from 'child_process'

function imagePairs(): any[] {
  return []
}

async function upload(req: Request, res: Response) {
  const cards = req.files?.cards as UploadedFile
  if (!cards)
    return res.status(400).send("No cards were uploaded")

  cards.mv(`./pdf/${uniqid()}.pdf`)

  res.send("oh hi")
}

function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir)
}

function createDirs() {
  createDirIfNotExists('pdf')
  createDirIfNotExists('svg')
  createDirIfNotExists('png')
}

async function isProgramInstalled(program: string): Promise<boolean> {
  return new Promise(resolve => {
    const process = spawn(program, ['--version'], { shell: true })
    process.stdout.on('data', () => resolve(true))
    process.stderr.on('data', () => resolve(false))
  })
}

async function checkRequirements() {
  for (const program of ['pdf2svg']) {
    if (!await isProgramInstalled(program))
      throw new Error(`${program} not installed`)
  }
}

async function app() {
  await checkRequirements()

  createDirs()
  startProcessingPDFFiles()
  startProcessingSVGFiles()

  const e = express()

  e.use(fileUpload())
  e.use(express.static('png'))

  e.set('view engine', 'pug')
  routes().forEach(route => e.get(route.url, route.controller))

  e.post('/upload', upload)
  return e
}

export async function startCardDB() {
  const port = 3001
  http
    .createServer(await app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}
