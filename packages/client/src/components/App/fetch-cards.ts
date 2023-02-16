import { Environment } from "root/environment"

export type ServerCard = {
  id: string,
  emissions: number,
  image: string,
  language: string,
  languageLabel: string,
  name: string
}

export async function fetchCards(env: Environment): Promise<ServerCard[]> {
  try {
    return (await fetch(`${env.httpServerURL}/${env.language}/cards.json`)).json()
  } catch (e) {
    console.log("Failed to fetch cards:", e)
    return []
  }
}

