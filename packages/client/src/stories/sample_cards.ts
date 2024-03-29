import { CardDesign } from '../core/card_design'

const card: CardDesign = {
  card: "pendla",
  title: "Pendla",
  subtitle: "i medelstor biodieselbil",
  emissions: 4000,
  descr_front: "Köra 40 km varje arbetsdag i ett år",
  descr_back: "Biodieselproduktionen leder till avskogning vilket orsakar stora men svåruppskattade utsläpp",
  duration: "230 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#FAD44C",
}

const card2: CardDesign = {
  card: "blandkost",
  title: "Blandkost",
  subtitle: "svensk genomsnitt",
  emissions: 2000,
  descr_front: "Äta som en genomsnittlig svensk",
  descr_back: "Den största andelen utsläpp kommer från nötkött (45 %) och mjölkprodukter (25 %)",
  duration: "365 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#61ABB3",
}

const card3: CardDesign = {
  card: "dator",
  title: "Dator",
  subtitle: "påslagen dygnet runt",
  emissions: 110,
  descr_front: "Ha en stationär dator påslagen dygnet runt under ett år",
  descr_back: "Utsläppen kommer framför allt från elförbrukningen",
  duration: "365 dagar",

  bg_color_front: "#1C1C45",
  bg_color_back: "#265157",
}

const blargh: CardDesign = {
  card: "blargh",
  title: "Blargh",
  subtitle: "",
  emissions: 100,
  descr_front: "",
  descr_back: "",
  duration: "",

  bg_color_front: "#1C1C45",
  bg_color_back: "#265157",
}

const honk: CardDesign = {
  card: "honk",
  title: "Honk",
  subtitle: "",
  emissions: 200,
  descr_front: "",
  descr_back: "",
  duration: "",
  bg_color_front: "#1C1C45",
  bg_color_back: "#265157",
}

const ohhi: CardDesign = {
  card: "oh-hi",
  title: "Oh hi",
  subtitle: "",
  emissions: 9001,
  descr_front: "",
  descr_back: "",
  duration: "",
  bg_color_front: "#1C1C45",
  bg_color_back: "#265157",
}

const cards = [
  card,
  card2,
  card3,
  blargh,
  honk,
  ohhi
]

export const cardDesigns = cards
