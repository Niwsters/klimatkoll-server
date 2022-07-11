import fs from 'fs'
import { Request, Response } from 'express'
import images, { Image } from 'images'
import uniqid from 'uniqid'

export function pairImagesView(_req: Request, res: Response) {
  const images = fs.readdirSync('png')
  res.render('pair-images', { images })
}

function createPair(front: string, back: string): Image {
  return images(2048, 2048)
    .draw(images(`./png/${front}`), 0, 0)
    .draw(images(`./png/${back}`), 1024, 0)
    .save(`./pairs/${uniqid()}.png`, { quality: 100 })
}

export function pairImages(req: Request, res: Response) {
  createPair(req.body.front, req.body.back)
  res.redirect("/pair-images")
}

export async function removeImagePair(image: string) {
  fs.rmSync(`./pairs/${image}`)
}
