export interface CardData {
  name: string
  emissions: number
}

export class Card {
  id: number
  name: string
  emissions: number

  constructor(id: number, name: string, emissions: number) {
    this.id = id
    this.name = name
    this.emissions = emissions
  }
}
