import fs from 'fs'
import { Database } from 'sqlite3'
import { sleep } from '../sleep'
import { cards } from './cards'
import { createCard } from './create-card'
import { Location } from '../location'

// Loops through existing image pairs and adds cards into database if missing
async function processImagePairs(db: Database, location: Location) {
  const existing = (await cards(db)).map(card => card.image.replace(/^\//, ''))
  const pairs = fs.readdirSync(location.pairsFolder)
  pairs
    .filter(pair => !existing.includes(pair))
    .forEach(async (pair) => await createCard(db, pair))
}

export async function startProcessingImagePairs(db: Database, location: Location) {
  while (true) {
    await processImagePairs(db, location)
    await sleep(1000)
  }
}
