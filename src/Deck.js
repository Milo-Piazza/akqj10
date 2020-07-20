module.exports = class Deck {

    static suits = ["Spades", "Clubs", "Diamonds", "Hearts"];
    static ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    constructor() {
        this.cardCount = 52;
        this.cardIdsDrawn = new Set();
    }

    drawCard() {
        var cardId = Math.floor(Math.random() * this.cardCount);
        while (this.cardIdsDrawn.has(cardId)) {
            cardId = Math.floor(Math.random() * this.cardCount);
        }
        var card = this.constructor.cardFromId(cardId);
        return card
    }

    static cardFromId(cardId) {
        return {
            suit: this.suits[Math.floor(cardId / this.ranks.length)],
            rank: this.ranks[Math.floor(cardId % this.ranks.length)]
        }
    }
}