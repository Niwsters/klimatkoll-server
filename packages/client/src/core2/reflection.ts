import { Card } from './card'
import { SpaceCards } from './emissions_line'

export type Reflection = {
  card: Card,
  reflected: Card
}

export const reflections = (emissionsLine: Card[], spaceCards: SpaceCards): Reflection[] => {
  return [
    {
      card: spaceCards[0] || "nocard",
      reflected: emissionsLine[0] || "nocard"
    }
  ]
}
