import { UploadedFile } from 'express-fileupload'
import uniqid from 'uniqid'
import { Location } from './location'
import { Controller } from './types'

export function uploadPDF(location: Location): Controller {
  return async (req, res) => {
    const cards = req.files?.cards as UploadedFile
    if (!cards)
      return res.status(400).send("No cards were uploaded")

    cards.mv(location.pdfFile(uniqid() + '.pdf'))

    res.redirect("/admin/upload")
  }
}
