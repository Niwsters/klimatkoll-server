import { CardDesign } from '../core2/card_design'

export const card: CardDesign = {
  name: "pendla",
  title: "Pendla",
  subtitle: "i medelstor biodieselbil",
  emissions: 4000,
  descr_front: "Köra 40 km varje arbetsdag i ett år",
  descr_back: "Biodieselproduktionen leder till avskogning vilket orsakar stora men svåruppskattade utsläpp",
  duration: "230 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#FAD44C",
}

export const card2: CardDesign = {
  name: "blandkost",
  title: "Blandkost",
  subtitle: "svensk genomsnitt",
  emissions: 2000,
  descr_front: "Äta som en genomsnittlig svensk",
  descr_back: "Den största andelen utsläpp kommer från nötkött (45 %) och mjölkprodukter (25 %)",
  duration: "365 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#61ABB3",
}

export const card3: CardDesign = {
  name: "dator",
  title: "Dator",
  subtitle: "påslagen dygnet runt",
  emissions: 110,
  descr_front: "Ha en stationär dator påslagen dygnet runt under ett år",
  descr_back: "Utsläppen kommer framför allt från elförbrukningen",
  duration: "365 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#265157",
}

const space: CardDesign = {
  name: "space",
  title: "",
  subtitle: "",
  emissions: 0,
  descr_front: "",
  descr_back: "",
  duration: "",
  bg_color_back: "",
  bg_color_front: ""
}

const noCard: CardDesign = {
  name: "no-card",
  title: "",
  subtitle: "",
  emissions: 0,
  descr_front: "",
  descr_back: "",
  duration: "",
  bg_color_back: "",
  bg_color_front: ""
}

const cards = [
  card,
  card2,
  card3,
  space,
  noCard
]

export function getCardDesign(name: string): CardDesign {
  const card = cards.find(c => c.name === name)
  if (card === undefined) throw new Error(`Card design not found: ${name}`)
  return card
}
