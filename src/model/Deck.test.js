import Deck from "./Deck";

test ("Test drawing all 52 cards with no duplicates", () => {
    const deck = new Deck();
    const cards = new Set();
    for (let i = 0; i < 52; i++) {
        const card = deck.drawCard();
        const cardstr = card.rank + card.suit;
        expect(cards.has(cardstr)).toBeFalsy();
        cards.add(cardstr);
    }
})