import { drawCard, CARD_WIDTH, CARD_HEIGHT } from '../../../client/src/components/Canvas/draw_card'

const start = () => {
  const elements = document.getElementsByClassName("klimatkoll-card-preview")
  for (const elem of elements) {
    const canvas = document.createElement("canvas")
    canvas.width = CARD_WIDTH*2
    canvas.height = CARD_HEIGHT
    elem.append(canvas)

    const cardJSON = elem.attributes.getNamedItem("card")?.value || "{}"
    const card = {
      name: "",
      title: "",
      subtitle: "",
      emissions: 0,
      descr_front: "",
      descr_back: "",
      duration: "",

      bg_color_front: "#1C1C45",
      bg_color_back: "#FAD44C",
      x: CARD_WIDTH / 2,
      y: CARD_HEIGHT / 2,
      ...JSON.parse(cardJSON)
    }
    const context = canvas.getContext("2d")
    if (context) {
      drawCard(context, card)
      drawCard(context, {...card, x: card.x + CARD_WIDTH, flipped: true })
    }
  }
}

window.onload = start
