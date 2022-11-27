import fs from 'fs'

export function findFiles(src='./src', endswith='ts') {
  let result = []
  const files = fs.readdirSync(src)
  for (const file of files) {
    const fullPath = `${src}/${file}`
    const isDirectory = fs.statSync(fullPath).isDirectory()

    if (isDirectory) {
      result = [...result, ...findFiles(fullPath)]
    } else {
      result = [...result, fullPath]
    }
  }

  return result
}
