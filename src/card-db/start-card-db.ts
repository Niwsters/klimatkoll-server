import http from 'http'
import express from 'express'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import { startProcessingPDFFiles } from './process-pdf-files'
import { startProcessingSVGFiles } from './process-svg-files'
import { routes } from './routes'
import { spawn } from 'child_process'

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
  routes().forEach(route => {
    switch (route.method) {
      case "post":
        e.post(route.url, route.controller)
      default:
        e.get(route.url, route.controller)
    }
  })

  return e
}

export async function startCardDB() {
  const port = 3001
  http
    .createServer(await app())
    .listen(3001, () => console.log(`Server listening on ${port}`))
}