import fs from 'fs'
import { Request, Response } from 'express'
import images from 'images'
import uniqid from 'uniqid'
import { Controller } from './types'
import { Location } from './location'

export function pairImagesView(location: Location): Controller {
  return async (_req: Request, res: Response) => {
    const images = fs.readdirSync(location.pngFolder)
    res.render('pair-images', { images })
  }
}

function createPair(front: string, back: string, location: Location) {
  try {
    images(2048, 2048)
      .draw(images(front), 0, 0)
      .draw(images(back), 1024, 0)
      .save(`${location.pairsFolder}/${uniqid()}.png`, { quality: 100 })

    fs.rmSync(front)
    fs.rmSync(back)
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
