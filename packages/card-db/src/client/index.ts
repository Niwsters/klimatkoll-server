import { drawCard, CARD_WIDTH, CARD_HEIGHT } from '../../../client/src/components/Canvas/draw_card'

const start = () => {
  const elements = document.getElementsByClassName("klimatkoll-card-preview")
  for (const elem of elements) {
    const canvas = document.createElement("canvas")
    canvas.width = CARD_WIDTH
    canvas.height = CARD_HEIGHT
    elem.append(canvas)

    const cardJSON = elem.attributes.getNamedItem("card").value
    const card = {
      name: "pendla",
      title: "Pendla",
      subtitle: "i medelstor biodieselbil",
      emissions: 4000,
      descr_front: "Köra 40 km varje arbetsdag i ett år",
      descr_back: "Biodieselproduktionen leder till avskogning vilket orsakar stora men svåruppskattade utsläpp",
      duration: "230 dagar",

      bg_color_front: "#1C1C45",
      bg_color_back: "#FAD44C",
      x: CARD_WIDTH / 2,
      y: CARD_HEIGHT / 2,
      ...JSON.parse(cardJSON)
    }
    const context = canvas.getContext("2d")
    drawCard(context, card)
  }
}

window.onload = start
