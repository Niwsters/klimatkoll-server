export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]
export const entries = <T>(obj: T): Entries<T> => {
  return Object.entries(obj as any) as any
}

type Key = string | number
export const dict = <T>(list: T[], key: (t: T) => Key) => {
  let dict: { [key: Key]: T } = {}
  for (const item of list) {
    dict[key(item)] = item
  }
  return dict
}

export const distance = (a: number, b: number): number => Math.abs(a - b)
export const distance2D = (
  ax: number,
  ay: number,
  bx: number,
  by: number
): number => Math.sqrt(Math.pow(distance(ax, bx), 2) + Math.pow(distance(ay, by), 2)) 
