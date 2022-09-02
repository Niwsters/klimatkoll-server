import { sleep } from "./sleep"
import fs from 'fs'
import { Controller } from "./types"
import { Location } from "./location"

function imagesToRemove(location: Location): string[] {
  try {
    return fs.readdirSync(location.imagesToRemoveFolder)
             .map(location.imageToRemoveFile, location)
  } catch(e) {
    console.log('WARNING: Image remover could not read folder\n', e)
    return []
  }
}

function removeImages(location: Location) {
  for (const image of imagesToRemove(location)) {
    fs.rmSync(image)
  }
}

export async function removeImage(filename: string, location: Location) {
  fs.renameSync(location.pngFile(filename), location.imageToRemoveFile(filename))
}

export async function startImageRemover(location: Location) {
  while (true) {
    try {
      removeImages(location)
      await sleep(1000)
    } catch (e) {
      console.log(e)
    }
  }
}

function view(location: Location): Controller {
  return async (_req, _res, renderView) => {
    renderView("remove-images", { images: fs.readdirSync(location.pngFolder) })
  }
}

function removeImagesView(location: Location): Controller {
  return async (req, res) => {
    const images: string[] = req.body.images || []
    images.forEach(image => removeImage(image, location))
    res.redirect('./remove-images')
  }
}

export default {
  view,
  remove: removeImagesView
}
