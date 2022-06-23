import { Card, CardData } from './cards'

export const cards: Card[] = [
  {
    "name": "beef-burger",
    "emissions": 700
  },
  {
    "name": "beef",
    "emissions": 3000
  },
  {
    "name": "car-travel-eu",
    "emissions": 1400
  },
  {
    "name": "car-travel-us",
    "emissions": 4500
  },
  {
    "name": "chicken",
    "emissions": 200
  },
  {
    "name": "commute-bus-diesel",
    "emissions": 200
  },
  {
    "name": "commute-electric-bike",
    "emissions": 10
  },
  {
    "name": "commute-electric-car-eu",
    "emissions": 500
  },
  {
    "name": "commute-electric-car-us",
    "emissions": 1200
  },
  {
    "name": "commute-train-eu",
    "emissions": 80
  },
  {
    "name": "commute-suv-us",
    "emissions": 2800
  },
  {
    "name": "dishwasher-germany",
    "emissions": 60
  },
  {
    "name": "fridge-freezer-germany",
    "emissions": 140
  },
  {
    "name": "fridge-freezer-us",
    "emissions": 600
  },
  {
    "name": "halloumi-burger",
    "emissions": 400
  },
  {
    "name": "halved-food-waste",
    "emissions": -200
  },
  {
    "name": "heating-cooling-california-80m2",
    "emissions": 1200
  },
  {
    "name": "heating-cooling-california-200m2",
    "emissions": 3000
  },
  {
    "name": "heating-fossil-uk",
    "emissions": 4500
  },
  {
    "name": "heating-ground-source",
    "emissions": 250
  },
  {
    "name": "heating-passive",
    "emissions": 120
  },
  {
    "name": "heating-sweden-electric",
    "emissions": 700
  },
  {
    "name": "hot-water-eu",
    "emissions": 500
  },
  {
    "name": "hot-water-us",
    "emissions": 1000
  },
  {
    "name": "leather-shoes",
    "emissions": 160
  },
  {
    "name": "mixed-diet-eu",
    "emissions": 1800
  },
  {
    "name": "mixed-diet-us",
    "emissions": 2600
  },
  {
    "name": "new-laptop",
    "emissions": 350
  },
  {
    "name": "new-smartphone",
    "emissions": 50
  },
  {
    "name": "plane-beijing-la",
    "emissions": 2000
  },
  {
    "name": "plane-beijing-shanghai",
    "emissions": 300
  },
  {
    "name": "plane-johannesburg-london",
    "emissions": 1800
  },
  {
    "name": "plane-la-ny",
    "emissions": 800
  },
  {
    "name": "plane-paris-ny",
    "emissions": 1200
  },
  {
    "name": "plane-sao-paolo-chicago",
    "emissions": 1600
  },
  {
    "name": "plant-trees-uganda",
    "emissions": -120
  },
  {
    "name": "pork",
    "emissions": 400
  },
  {
    "name": "recycling-sweden",
    "emissions": -400
  },
  {
    "name": "roses-kenya",
    "emissions": 50
  },
  {
    "name": "roses-netherlands",
    "emissions": 350
  },
  {
    "name": "shipping-air-china-europe",
    "emissions": 250
  },
  {
    "name": "shipping-road-europe",
    "emissions": 10
  },
  {
    "name": "shower-5min-us",
    "emissions": 160
  },
  {
    "name": "shower-10min-us",
    "emissions": 700
  },
  {
    "name": "solar-panels-eu",
    "emissions": -1800
  },
  {
    "name": "solar-panels-us",
    "emissions": -7000
  },
  {
    "name": "streaming-sweden",
    "emissions": 50
  },
  {
    "name": "sugar-snaps-kenya",
    "emissions": 100
  },
  {
    "name": "sugar-snaps-netherlands",
    "emissions": 10
  },
  {
    "name": "textile-shoes",
    "emissions": 10
  },
  {
    "name": "train-beijing-shanghai",
    "emissions": 120
  },
  {
    "name": "tv-germany",
    "emissions": 40
  },
  {
    "name": "tv-us",
    "emissions": 350
  },
  {
    "name": "vegan",
    "emissions": 500
  },
  {
    "name": "veggie-burger",
    "emissions": 60
  }
].map((c: CardData, i: number) => {
  return {
    ...c,
    id: i+1
  }
})

export default cards
