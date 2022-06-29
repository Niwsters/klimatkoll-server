import fs from 'fs'
import { Request, Response } from 'express'
import images from 'images'
import uniqid from 'uniqid'

export function pairImagesView(_req: Request, res: Response) {
  const images = fs.readdirSync('png')
  res.render('pair-images', { images })
}

export function pairImages(req: Request, res: Response) {
  images(2048, 2048)
    .draw(images(`./png/${req.body.front}`), 0, 0)
    .draw(images(`./png/${req.body.back}`), 1024, 0)
    .save(`./pairs/${uniqid()}.png`, { quality: 100 })
  res.redirect("/pair-images")
}
