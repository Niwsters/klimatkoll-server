import fs from 'fs'
import images from 'images'
import { Controller } from './types'
import { Location } from './location'

function existingPairs(location: Location): string[] {
  return fs.readdirSync(location.pairsFolder)
}

function pairedImages(location: Location): Set<string> {
  let images = existingPairs(location)
    .map(s => s.split(/([^-]+-[^-]+)-/))
    .map(a => {
      let [left, right] = a.slice(1)
      return [left + '.png', right]
    })
    .flat()
    .filter(s => s !== '')
  return new Set(images)
}

export function pairImagesView(location: Location): Controller {
  return async (_req, _res, renderView) => {
    const alreadyPaired = pairedImages(location)

    const images = fs.readdirSync(location.pngFolder)
      .filter(i => !alreadyPaired.has(i))


    renderView('pair-images', { images })
  }
}

function fileName(src: string): string {
  let match = src.match(/([^\/]+)\.png$/) || ['', '']
  return match[1]
}

function pairFileName(front: string, back: string): string {
  return `${fileName(front)}-${fileName(back)}`
}

function createPair(front: string, back: string, location: Location) {
  try {
    images(2048, 2048)
      .draw(images(front), 0, 0)
      .draw(images(back), 1024, 0)
      .save(`${location.pairsFolder}/${pairFileName(front, back)}.png`, { quality: 100 })
  } catch (e) {
    console.log(`WARNING: Failed to create pair:`, e)
  }
}

export function pairImages(location: Location): Controller {
  return async (req, res) => {
    createPair(location.pngFile(req.body.front), location.pngFile(req.body.back), location)
    res.redirect("/admin/pair-images")
  }
}

export async function removeImagePair(image: string, location: Location) {
  fs.rmSync(`${location.pairsFolder}/${image}`)
}
