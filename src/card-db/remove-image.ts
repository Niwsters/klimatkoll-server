import { sleep } from "./sleep"
import fs from 'fs'
import { Controller } from "./types"
import { pngFullPath, pngs } from "./pngs"

const path = "./images-to-remove"

function imageToRemovePath(filename: string) {
  return `${path}/${filename}`
}

function imagesToRemove(): string[] {
  try {
    return fs.readdirSync(path).map(imageToRemovePath)
  } catch(e) {
    console.log('WARNING: Image remover could not read folder\n', e)
    return []
  }
}

function removeImages() {
  for (const image of imagesToRemove()) {
    fs.rmSync(image)
  }
}

export async function removeImage(filename: string) {
  fs.renameSync(pngFullPath(filename), imageToRemovePath(filename))
}

export async function startImageRemover() {
  while (true) {
    try {
      removeImages()
      await sleep(1000)
    } catch (e) {
      console.log(e)
    }
  }
}

function view(): Controller {
  return async (_req, res) => {
    res.render("remove-images", { images: await pngs() })
  }
}

function removeImagesView(): Controller {
  return async (req, res) => {
    const images: string[] = req.body.images || []
    images.forEach(removeImage)
    res.redirect('./remove-images')
  }
}

export default {
  view,
  remove: removeImagesView
}
