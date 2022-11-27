import { UploadedFile } from 'express-fileupload'
import uniqid from 'uniqid'
import { Location } from './location'
import { Controller } from './types'
import yauzl from 'yauzl'
import fs from 'fs'

async function handleZipFile(location: Location, zipBuffer: Buffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, {}, (err, zipfile) => {
      if (err) reject(err)

      zipfile.on("entry", entry => {
        const destination = location.pngFolder + '/' + uniqid() + '.png'

        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) reject(err)

          const writeStream = fs.createWriteStream(destination)
          readStream.pipe(writeStream)
        })
      })

      zipfile.on("end", resolve)
    })
  })
}

export function zip(location: Location): Controller {
  return async (req, res) => {
    const zip = req.files?.cards as UploadedFile
    if (!zip)
      return res.status(400).send("No cards were uploaded")

    await handleZipFile(location, zip.data)

    res.redirect("/admin/upload")
  }
}
