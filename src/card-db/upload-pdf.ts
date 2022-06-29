import { UploadedFile } from 'express-fileupload'
import { Request, Response } from 'express'
import uniqid from 'uniqid'

export async function uploadPDF(req: Request, res: Response) {
  const cards = req.files?.cards as UploadedFile
  if (!cards)
    return res.status(400).send("No cards were uploaded")

  cards.mv(`./pdf/${uniqid()}.pdf`)

  res.redirect("/upload")
}
