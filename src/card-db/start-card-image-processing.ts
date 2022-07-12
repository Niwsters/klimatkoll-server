import fs from 'fs'
import { startProcessingPDFFiles } from './process-pdf-files'
import { startProcessingSVGFiles } from './process-svg-files'
import { startProcessingImagePairs } from './cards'
import { startImageRemover } from './remove-image'
import { Database } from 'sqlite3'
import { location, Location } from './location'

function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir)
}

function createDirs(location: Location) {
  createDirIfNotExists(location.pdfFolder)
  createDirIfNotExists(location.svgFolder)
  createDirIfNotExists(location.pngFolder)
  createDirIfNotExists(location.pairsFolder)
  createDirIfNotExists(location.imagesToRemoveFolder)
}

export function startCardImageProcessing(db: Database) {
  const loc = location("../klimatkoll-server-data")
  createDirs(loc)
  startProcessingPDFFiles(loc)
  startProcessingSVGFiles(loc)
  startProcessingImagePairs(db, loc)
  startImageRemover(loc)
}
