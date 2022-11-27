import { CardData } from "shared/models"

export async function fetchCardData(baseUrl: string): Promise<CardData[]> {
  const response = await fetch(`${baseUrl}/cards.json`)
  return response.json()
}
