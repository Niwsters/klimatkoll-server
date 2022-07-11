import fs from 'fs'

export async function pngs(): Promise<string[]> {
  return fs.readdirSync('./png')
}

export function pngFullPath(filename: string): string {
  return `./png/${filename}`
}
