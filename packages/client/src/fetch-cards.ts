import { Environment } from "root/environment"
import { CardDesign } from "core/card_design"

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

const toFrontendCard = (card: ServerCard): CardDesign => {
  return {
    card: card.name,
    title: card.title,
    subtitle: card.subtitle,
    emissions: card.emissions,
    descr_back: card.descr_back,
    descr_front: card.descr_back,
    duration: card.duration,
    bg_color_back: card.bg_color_back,
    bg_color_front: card.bg_color_front
  }
}

export async function fetchCards(env: Environment): Promise<CardDesign[]> {
  try {
    const cards = await (await fetch(`${env.httpServerURL}/${env.language}/cards.json`)).json()
    return cards.map(toFrontendCard)
  } catch (e) {
    console.log("Failed to fetch cards:", e)
    return []
  }
}
