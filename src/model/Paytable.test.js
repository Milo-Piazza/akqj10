const Paytable = require("./Paytable");

function getHandFromString(string) {
    //Get an unsuited hand from a string of ranks.
    let suit = "Spades";
    var hand = [];
    for (const rank of string) {
        var card = {
            "suit": suit,
            "rank": rank
        };
        hand.push(card);
        suit = suit === "Spades" ? "Hearts" : "Spades";
    }
    return hand;
}

function getSuitedHandFromString(string) {
    //Get an unsuited hand from a string of ranks.
    var hand = [];
    for (const rank of string) {
        var card = {
            "suit": "Spades",
            "rank": rank
        };
        hand.push(card);
    }
    return hand;
}

const paytable = new Paytable();

test("Test whether a high pair is recognized", () => {
    const hand = getHandFromString("782KK");
    expect(paytable.isJacksOrBetter(hand)).toBeTruthy();
    expect(paytable.isThreeOfAKind(hand)).toBeFalsy();
})

test("Test whether a low pair is not jacks or better", () => {
    const hand = getHandFromString("782TT");
    expect(paytable.isJacksOrBetter(hand)).toBeFalsy();
})

test("Test whether a non-pair is jacks or better", () => {
    const hand = getHandFromString("2357J");
    expect(paytable.isJacksOrBetter(hand)).toBeFalsy();
}) 

test("Test two pair", () => {
    const twoPair = getHandFromString("67678");
    const onePair = getHandFromString("K293K");
    expect(paytable.isTwoPair(twoPair)).toBeTruthy();
    expect(paytable.isTwoPair(onePair)).toBeFalsy();
})

test("Test three of a kind", () => {
    const three = getHandFromString("54553");
    const junk = getHandFromString("59452");
    expect(paytable.isThreeOfAKind(three)).toBeTruthy();
    expect(paytable.isThreeOfAKind(junk)).toBeFalsy();
})

test("Test straights", () => {
    const wheel = getHandFromString("425A3");
    const broadway = getHandFromString("TKJQA");
    const inside = getHandFromString("34578");
    const pair = getHandFromString("AAKQJ");
    expect(paytable.isStraight(wheel)).toBeTruthy();
    expect(paytable.isStraight(broadway)).toBeTruthy();
    expect(paytable.isStraight(inside)).toBeFalsy();
    expect(paytable.isStraight(pair)).toBeFalsy();
})

test("Test flushes", () => {
    const flush = getSuitedHandFromString("2357J");
    const nonFlush = getHandFromString("2357J");
    expect(paytable.isFlush(flush)).toBeTruthy();
    expect(paytable.isFlush(nonFlush)).toBeFalsy();
})

test("Test full house", () => {
    const fullHouse = getHandFromString("K66KK");
    const three = getHandFromString("54443");
    expect(paytable.isFullHouse(fullHouse)).toBeTruthy();
    expect(paytable.isFullHouse(three)).toBeFalsy();
})

test("Test four of a kind", () => {
    const fullHouse = getHandFromString("K66KK");
    const four = getHandFromString("99699");
    expect(paytable.isFourOfAKind(fullHouse)).toBeFalsy();
    expect(paytable.isFourOfAKind(four)).toBeTruthy();
})

test("Test straight flushes", () => {
    const straightFlush = getSuitedHandFromString("J89TQ");
    const straight = getHandFromString("J89TQ");
    const flush = getSuitedHandFromString("369QA");
    expect(paytable.isStraightFlush(straightFlush)).toBeTruthy();
    expect(paytable.isStraightFlush(straight)).toBeFalsy();
    expect(paytable.isStraightFlush(flush)).toBeFalsy();
}) 

test("Test royal flushes", () => {
    const straightFlush = getSuitedHandFromString("A2345");
    const royalFlush = getSuitedHandFromString("JAKTQ");
    const broadway = getHandFromString("JAKTQ");
    expect(paytable.isStraightFlush(royalFlush)).toBeTruthy();
    expect(paytable.isRoyalFlush(royalFlush)).toBeTruthy();
    expect(paytable.isRoyalFlush(straightFlush)).toBeFalsy();
    expect(paytable.isRoyalFlush(broadway)).toBeFalsy();
})

test("Test payout calculations", () => {
    const royalFlush = getSuitedHandFromString("JAKTQ");
    const straightFlush = getSuitedHandFromString("A2345");
    const four = getHandFromString("99699");
    const fullHouse = getHandFromString("K66KK");
    const flush = getSuitedHandFromString("369QA");
    const straight = getHandFromString("J89TQ");
    const three = getHandFromString("54443");
    const twoPair = getHandFromString("67678");
    const onePair = getHandFromString("J293J");
    const lowPair = getHandFromString("98946");
    const junk = getHandFromString("AK678");
    expect(paytable.getPayForHand(royalFlush, 5)).toBe(4000);
    expect(paytable.getPayForHand(royalFlush, 3)).toBe(750);
    expect(paytable.getPayForHand(straightFlush, 5)).toBe(250);
    expect(paytable.getPayForHand(four, 5)).toBe(125);
    expect(paytable.getPayForHand(fullHouse, 5)).toBe(45);
    expect(paytable.getPayForHand(flush, 5)).toBe(30);
    expect(paytable.getPayForHand(straight, 5)).toBe(20);
    expect(paytable.getPayForHand(three, 5)).toBe(15);
    expect(paytable.getPayForHand(twoPair, 5)).toBe(10);
    expect(paytable.getPayForHand(onePair, 5)).toBe(5);
    expect(paytable.getPayForHand(lowPair, 5)).toBe(0);
    expect(paytable.getPayForHand(junk, 5)).toBe(0);
})