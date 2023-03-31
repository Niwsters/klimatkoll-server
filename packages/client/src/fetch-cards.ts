import { Environment } from "root/environment"

export type ServerCard = {
  readonly id: string
  readonly name: string

  readonly language: string
  readonly languageLabel: string

  readonly bg_color_back: string
  readonly bg_color_front: string
  readonly title: string
  readonly subtitle: string
  readonly emissions: number
  readonly descr_front: string
  readonly descr_back: string
  readonly duration: string
}

export async function fetchCards(env: Environment): Promise<ServerCard[]> {
  try {
    const cards = await (await fetch(`${env.httpServerURL}/${env.language}/cards.json`)).json()
    return cards
  } catch (e) {
    console.log("Failed to fetch cards:", e)
    return []
  }
}
