export function pdfFolder(location: string): string {
  return `${location}/pdf`
}

export function svgFolder(location: string): string {
  return `${location}/svg`
}

export function pdfFullPath(location: string, filename: string): string {
  return `${pdfFolder(location)}/${filename}`
}

export function svgFullPath(location: string, filename: string): string {
  return `${svgFolder(location)}/${filename}`
}

export function pairsFolder(location: string): string {
  return `${location}/pairs`
}

export function imagesToRemoveFolder(location: string): string {
  return `${location}/images-to-remove`
}

function imageToRemoveFullPath(root: string, filename: string) {
  return `${imagesToRemoveFolder(root)}/${filename}`
}

function pngFolder(root: string): string {
  return `${root}/png`
}

function pngFile(root: string, filename: string): string {
  return `${pngFolder(root)}/${filename}`
}

export type FolderPath = string
export type FilePath = (filename: string) => string

export type Location = {
  root: FolderPath,
  pdfFolder: FolderPath,
  pdfFile: FilePath,
  svgFolder: FolderPath,
  svgFile: FilePath,
  pngFolder: FolderPath,
  pngFile: FilePath,
  pairsFolder: FolderPath,
  imagesToRemoveFolder: FolderPath,
  imageToRemoveFile: FilePath
}

export function location(root: string): Location {
  return {
    root,
    pdfFolder: pdfFolder(root),
    pdfFile: (filename: string) => pdfFullPath(root, filename),
    svgFolder: svgFolder(root),
    svgFile: (filename: string) => svgFullPath(root, filename),
    pngFolder: pngFolder(root),
    pngFile: (filename: string) => pngFile(root, filename),
    pairsFolder: pairsFolder(root),
    imagesToRemoveFolder: imagesToRemoveFolder(root),
    imageToRemoveFile: (filename: string) => imageToRemoveFullPath(root, filename)
  }
}
