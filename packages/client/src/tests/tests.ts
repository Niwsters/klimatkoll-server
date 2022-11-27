import playCardFromDeck from './card-played-from-deck.spec'
import playCardFromHand from './card-played-from-hand.spec'
import cardAnimation from './card-animation.spec'
import drawCard from './draw-card.spec'
import rearrangeHand from './rearrange-hand.spec'
import rearrangeOpponentHand from './rearrange-opponent-hand.spec'
import hoverEmissionsLine from './hover-emissions-line.spec'
import hoverHand from './hover-hand.spec'
import incorrectCardPlacement from './incorrect-card-placement.spec'
import showNextCard from './show-next-card.spec'
import selectCard from './select-card.spec'
import makePlayCardRequest from './make-play-card-request.spec'
import emissionsLineZIndex from './emissions-line-z-index.spec'
import testStreamSource from './stream-source.spec'
import testStreamChannel from './stream-channel.spec'
import testInbox from './inbox.spec'
import testMPServer from './mpserver.spec'

playCardFromDeck()
playCardFromHand()
cardAnimation()
drawCard()
rearrangeHand()
rearrangeOpponentHand()
hoverEmissionsLine()
incorrectCardPlacement()
showNextCard()
hoverHand()
selectCard()
makePlayCardRequest()
emissionsLineZIndex()
testStreamSource()
testStreamChannel()
testInbox()
testMPServer()
