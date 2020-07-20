import Deck from "./Deck";

module.exports = class DeckWithJokers extends Deck {

    constructor(numJokers) {
        super();
        this.cardCount += numJokers;
    }

    static cardFromId(cardId) {
        if (cardId < this.suits.length * this.ranks.length) {
            return Deck.cardFromId(cardId)
        }
        return {
            suit: String(cardId - (this.suits.length * this.ranks.length)),
            rank: "Joker"
        }
    }
}