import fs from 'fs'
import { Request, Response } from 'express'

export function pairImagesView(_req: Request, res: Response) {
  const images = fs.readdirSync('png')
  res.render('pair-images', { images })
}

export function pairImages(req: Request, res: Response) {
  console.log(req.body)
  res.redirect("/pair-images")
}
