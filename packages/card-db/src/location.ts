function assetsFolder(root: string): string {
  return `${root}/assets`
}

export type FolderPath = string
export type FilePath = (filename: string) => string

export type Location = {
  root: FolderPath,
  assetsFolder: FolderPath
}

export function location(root: string): Location {
  return {
    root,
    assetsFolder: assetsFolder(root)
  } as const
}
