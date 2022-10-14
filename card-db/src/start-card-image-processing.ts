import fs from 'fs'
import { startProcessingImagePairs } from './cards'
import { startImageRemover } from './remove-image'
import { Database } from 'sqlite3'
import { Location } from './location'

function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir)
}

function createDirs(location: Location) {
  createDirIfNotExists(location.pngFolder)
  createDirIfNotExists(location.pairsFolder)
  createDirIfNotExists(location.imagesToRemoveFolder)
}

export function startCardImageProcessing(db: Database, location: Location) {
  createDirs(location)
  startProcessingImagePairs(db, location)
  startImageRemover(location)
}
