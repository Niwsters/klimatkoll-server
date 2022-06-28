import fs from 'fs'
import { Request, Response } from 'express'

export function pairImages(_req: Request, res: Response) {
  const images = fs.readdirSync('png')
  res.render('pair-images', { images })
}
