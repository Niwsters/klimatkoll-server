"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.Player = void 0;
const seedrandom_1 = __importDefault(require("seedrandom"));
const cards_1 = __importDefault(require("./cards"));
const database_1 = require("./database");
class Player {
    constructor(socketID) {
        this.hand = [];
        this.socketID = socketID;
    }
}
exports.Player = Player;
let lastCardID = 0;
const cards = cards_1.default.map((card) => {
    return Object.assign(Object.assign({}, card), { id: lastCardID++ });
});
class GameState {
    constructor() {
        this.deck = cards.slice();
        this.clientEvents = [];
        this.emissionsLine = [];
    }
    static createEvent(eventID, type, payload = {}) {
        return {
            event_id: eventID,
            event_type: type,
            payload: payload
        };
    }
    static shuffle(deck, seed) {
        deck = deck.slice();
        let currentIndex = deck.length;
        let temporaryValue;
        let randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(seedrandom_1.default(seed)() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = deck[currentIndex];
            deck[currentIndex] = deck[randomIndex];
            deck[randomIndex] = temporaryValue;
        }
        return deck;
    }
    static fromEvents(events) {
        const drawCard = (state) => {
            const card = state.deck.pop();
            if (!card)
                throw new Error("Deck ran out of cards");
            return card;
        };
        let lastClientEventID = 0;
        const createClientEvent = (eventType, payload = {}) => {
            return new database_1.GameEvent(lastClientEventID++, eventType, payload);
        };
        const getPlayer = (state, socketID) => {
            if (state.player1 && state.player1.socketID == socketID)
                return state.player1;
            if (state.player2 && state.player2.socketID == socketID)
                return state.player2;
            throw new Error("Can't find player with socketID: " + socketID);
        };
        const getOpponent = (state, socketID) => {
            if (!state.player1)
                throw new Error("Player 1 is undefined");
            if (!state.player2)
                throw new Error("Player 2 is undefined");
            if (state.player1.socketID == socketID)
                return state.player2;
            if (state.player2.socketID == socketID)
                return state.player1;
            throw new Error("Can't find opponent for socketID: " + socketID);
        };
        return events.reduce((state, event) => {
            state = Object.assign({}, state);
            const type = event.event_type;
            const p1 = state.player1 ? 1 : 0;
            const p2 = state.player2 ? 1 : 0;
            const playerCount = p1 + p2;
            if (type == "game_started") {
                const seed = event.payload.seed;
                return Object.assign(Object.assign({}, state), { deck: GameState.shuffle(state.deck, seed) });
            }
            else if (type == "player_connected") {
                // Ignore if all players already set
                if (state.player1 && state.player2)
                    return state;
                if (!state.player1)
                    return Object.assign(Object.assign({}, state), { player1: new Player(event.payload.socketID), clientEvents: [
                            ...state.clientEvents,
                            createClientEvent("waiting_for_players")
                        ] });
                if (!state.player2)
                    state.player2 = new Player(event.payload.socketID);
                // Now both players are set, so we draw their hands
                const player1 = state.player1;
                const player2 = state.player2;
                if (!player1)
                    throw new Error("Player 1 is undefined");
                if (!player2)
                    throw new Error("Player 2 is undefined");
                state.player1.hand = [0, 0, 0].map(() => drawCard(state));
                state.player2.hand = [0, 0, 0].map(() => drawCard(state));
                state.playerTurn = player1.socketID;
                const emissionsLineCard = drawCard(state);
                return Object.assign(Object.assign({}, state), { emissionsLine: [emissionsLineCard], clientEvents: [
                        ...state.clientEvents,
                        createClientEvent("playing"),
                        ...state.player1.hand.map((card) => {
                            return createClientEvent("draw_card", { card: card, socketID: player1.socketID });
                        }),
                        ...state.player2.hand.map((card) => {
                            return createClientEvent("draw_card", { card: card, socketID: player2.socketID });
                        }),
                        createClientEvent("card_played_from_deck", { card: emissionsLineCard, position: 0 }),
                        createClientEvent("player_turn", { socketID: state.playerTurn })
                    ] });
            }
            else if (type == "player_disconnected") {
                // Notify client
                return Object.assign(Object.assign({}, state), { clientEvents: [
                        ...state.clientEvents,
                        createClientEvent("opponent_disconnected")
                    ] });
            }
            else if (type == "card_played_from_hand") {
                const socketID = event.payload.socketID;
                const cardID = event.payload.cardID;
                const position = event.payload.position;
                const player = getPlayer(state, socketID);
                const opponent = getOpponent(state, socketID);
                // If it is not player's turn, ignore event
                if (state.playerTurn != player.socketID)
                    return Object.assign({}, state);
                // If either player's hand is empty, i.e. game is over, ignore event
                if ((state.player1 && state.player1.hand.length == 0) ||
                    (state.player2 && state.player2.hand.length == 0)) {
                    return Object.assign({}, state);
                }
                const opponentID = getOpponent(state, player.socketID).socketID;
                state.playerTurn = opponentID;
                state.clientEvents.push(createClientEvent("player_turn", { socketID: state.playerTurn }));
                // Pull card from hand
                const card = player.hand.find((card) => card.id === cardID);
                if (!card)
                    throw new Error("Player with socketID " + socketID + " has no card with ID " + cardID);
                player.hand = player.hand.filter(c => c != card);
                // Position works like this: [s,0,s,1,s,2,s] where s is a "shadow card" where
                // card can be placed, and 0,1,2 are card indexes in the emissions line
                const shadowedEL = state.emissionsLine.reduce((shadowedEL, card) => {
                    return [
                        ...shadowedEL,
                        card,
                        null
                    ];
                }, [null]);
                // If card placement is incorrect, move card to bottom of deck
                // and deal new card to player
                const cardBefore = shadowedEL[position - 1];
                const cardAfter = shadowedEL[position + 1];
                if ((cardBefore && cardBefore.emissions > card.emissions) ||
                    (cardAfter && cardAfter.emissions < card.emissions)) {
                    const newCard = drawCard(state);
                    player.hand.push(newCard);
                    return Object.assign(Object.assign({}, state), { deck: [card, ...state.deck], clientEvents: [
                            ...state.clientEvents,
                            createClientEvent("incorrect_card_placement", {
                                cardID: card.id,
                                socketID: player.socketID
                            }),
                            createClientEvent("draw_card", {
                                card: newCard,
                                socketID: player.socketID
                            })
                        ] });
                }
                // If card placement is correct, play card to emissions line 
                shadowedEL[position] = card;
                state.emissionsLine = shadowedEL.reduce((EL, card) => {
                    if (!card)
                        return EL;
                    return [
                        ...EL,
                        card
                    ];
                }, []);
                // Notify clients that card was played correctly
                state.clientEvents.push(createClientEvent("card_played_from_hand", event.payload));
                // If player ran out of cards, notify clients that they won
                if (player.hand.length == 0) {
                    state.clientEvents.push(createClientEvent("game_won", { socketID: player.socketID }));
                }
                return Object.assign({}, state);
            }
            else if (type == "vote_new_game") {
                return Object.assign(Object.assign({}, state), { clientEvents: [
                        ...state.clientEvents,
                        createClientEvent("vote_new_game", event.payload)
                    ] });
            }
            return state;
        }, new GameState());
    }
}
exports.GameState = GameState;
