import fs from 'fs'
import { findFiles } from './find-files.js'

export function onFileChange(func) {
  for (const file of findFiles()) {
    fs.watchFile(file, { interval: 100 }, () => {
      func()
    })
  }
}
