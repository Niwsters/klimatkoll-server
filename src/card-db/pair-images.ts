import fs from 'fs'
import { Request, Response } from 'express'
import images, { Image } from 'images'
import uniqid from 'uniqid'
import { Controller } from './types'
import { Location } from './location'

export function pairImagesView(location: Location): Controller {
  return async (_req: Request, res: Response) => {
    const images = fs.readdirSync(location.pngFolder)
    res.render('pair-images', { images })
  }
}

function createPair(front: string, back: string): Image {
  const image = images(2048, 2048)
    .draw(images(front), 0, 0)
    .draw(images(back), 1024, 0)
    .save(`./pairs/${uniqid()}.png`, { quality: 100 })

  fs.rmSync(front)
  fs.rmSync(back)

  return image
}

export function pairImages(location: Location): Controller {
  return async (req, res) => {
    createPair(location.pngFile(req.body.front), location.pngFile(req.body.back))
    res.redirect("/pair-images")
  }
}

export async function removeImagePair(image: string) {
  fs.rmSync(`./pairs/${image}`)
}
