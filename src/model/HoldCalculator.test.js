import HoldCalculator from "./HoldCalculator";
import Deck from "./Deck";
import Paytable from "./Paytable";

var calc = new HoldCalculator(new Deck(), new Paytable());

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

test("Test out counting for pair", () => {
    expect(calc.countOutsForJacksOrBetter(getHandFromString("2345J"), [true, true, true, false, true])).toBe(3);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("2345J"), [true, true, false, false, true])).toBe(132);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("AKQ23"), [true, true, true, false, false])).toBe(348);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("AKQJ3"), [true, true, true, true, false])).toBe(12);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("23JJJ"), [false, false, true, true, true])).toBe(0);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("28888"), [false, true, true, true, true])).toBe(0);
    expect(calc.countOutsForJacksOrBetter(getHandFromString("9956J"), [true, true, false, false, false])).toBe(0);
})

test("Test out counting for two pair", () => {
    //3 * 3choose2 * 42 + 9 * 4choose2 * 41
    expect(calc.countOutsForTwoPair(getHandFromString("22357"), [true, true, false, false, false])).toBe(2592);
    expect(calc.countOutsForTwoPair(getHandFromString("22337"), [true, true, true, true, false])).toBe(43);
    expect(calc.countOutsForTwoPair(getHandFromString("22237"), [true, true, true, false, false])).toBe(0);
})

test("Test out counting for three of a kind", () => {
    //2 * (45choose2 - (9 * 4choose2 + 3 * 3choose2))
    expect(calc.countOutsForThreeOfAKind(getHandFromString("22357"), [true, true, false, false, false])).toBe(1854);
    expect(calc.countOutsForThreeOfAKind(getHandFromString("22257"), [true, true, true, false, false])).toBe(969);
    expect(calc.countOutsForThreeOfAKind(getHandFromString("22337"), [true, true, true, true, false])).toBe(0);
    expect(calc.countOutsForThreeOfAKind(getHandFromString("33332"), [true, true, true, true, false])).toBe(0);
    expect(calc.countOutsForThreeOfAKind(getHandFromString("2345J"), [true, true, false, false, true])).toBe(9);
})

test("Test out counting for straight", () => {
    expect(calc.countOutsForStraight(getHandFromString("34569"), [true, true, true, true, false])).toBe(8);
    expect(calc.countOutsForStraight(getHandFromString("3467T"), [true, true, true, true, false])).toBe(4);
    expect(calc.countOutsForStraight(getHandFromString("A2459"), [true, true, true, true, false])).toBe(4);
    expect(calc.countOutsForStraight(getHandFromString("A2459"), [false, true, true, true, false])).toBe(28);
    expect(calc.countOutsForStraight(getHandFromString("AKQJ9"), [true, true, true, true, false])).toBe(4);
    //Straight flush is not a straight
    expect(calc.countOutsForStraight(getSuitedHandFromString("34569"), [true, true, true, true, false])).toBe(6);
    expect(calc.countOutsForStraight(getHandFromString("33478"), [true, true, true, true, false])).toBe(0);
})

test("Test out counting for flush", () => {
    expect(calc.countOutsForFlush(getSuitedHandFromString("2357J"), [true, true, true, true, false])).toBe(8);
    expect(calc.countOutsForFlush(getSuitedHandFromString("2357J"), [true, true, true, false, false])).toBe(26);
    //Straight flush is not a flush
    expect(calc.countOutsForFlush(getSuitedHandFromString("4567T"), [true, true, true, true, false])).toBe(6);
    expect(calc.countOutsForFlush(getSuitedHandFromString("AKQJ9"), [true, true, true, true, false])).toBe(7);
    //Unsuited hand is not a flush
    expect(calc.countOutsForFlush(getHandFromString("2357J"), [true, true, true, true, false])).toBe(0);
})

test("Test out counting for full house", () => {
    //2choose1 * (3 * 3choose2 + 9 * 4choose2) + (3 * 3choose3 + 9 * 4choose3)
    expect(calc.countOutsForFullHouse(getHandFromString("22345"), [true, true, false, false, false])).toBe(165);
    expect(calc.countOutsForFullHouse(getHandFromString("22257"), [true, true, true, false, false])).toBe(66);
    expect(calc.countOutsForFullHouse(getHandFromString("23567"), [true, true, false, false, false])).toBe(18);
    expect(calc.countOutsForFullHouse(getHandFromString("22337"), [true, true, true, true, false])).toBe(4);
})

test("Test out counting for four of a kind", () => {
    expect(calc.countOutsForFourOfAKind(getHandFromString("22227"), [true, true, true, true, false])).toBe(47);
    expect(calc.countOutsForFourOfAKind(getHandFromString("22267"), [true, true, true, true, false])).toBe(1);
    expect(calc.countOutsForFourOfAKind(getHandFromString("22267"), [true, true, true, false, false])).toBe(46);
    expect(calc.countOutsForFourOfAKind(getHandFromString("22345"), [true, true, false, false, false])).toBe(45);
    expect(calc.countOutsForFourOfAKind(getHandFromString("AAKQJ"), [true, false, false, false, false])).toBe(9);
})

test("Test out counting for straight flush", () => {
    //Outside straight flush draw
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("5789T"), [false, true, true, true, true])).toBe(2);
    //Inside straight flush draw
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("784TJ"), [true, true, false, true, true])).toBe(1);
    //A royal flush is NOT a straight flush
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("KQJT4"), [true, true, true, true, false])).toBe(1);
    //Runner runner draw
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("2QJT4"), [false, true, true, true, false])).toBe(2);
    //Runner runner runner draw
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("45AKQ"), [true, true, false, false, false])).toBe(3);
    //5 or 6 high straight flush
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("23459"), [true, true, true, true, false])).toBe(2);
    //Unsuited hand is not a straight flush
    expect(calc.countOutsForStraightFlush(getHandFromString("KQJT4"), [true, true, true, true, false])).toBe(0);
    expect(calc.countOutsForStraightFlush(getSuitedHandFromString("AKQJT"), [false, false, false, false, false])).toBe(31);
})

test("Test out counting for royal flush", () => {
    expect(calc.countOutsForRoyalFlush(getSuitedHandFromString("9AJQK"), [false, true, true, true, true])).toBe(1);
    expect(calc.countOutsForRoyalFlush(getSuitedHandFromString("9AJQ8"), [false, true, true, true, false])).toBe(1);
    expect(calc.countOutsForRoyalFlush(getHandFromString("A2345"), [true, false, false, false, false])).toBe(1);
    expect(calc.countOutsForRoyalFlush(getHandFromString("62345"), [false, false, false, false, false])).toBe(4);
    //Negative cases
    //Should not get a royal flush after discarding part of it
    expect(calc.countOutsForRoyalFlush(getSuitedHandFromString("9AJQK"), [true, true, true, true, false])).toBe(0);
    expect(calc.countOutsForRoyalFlush(getSuitedHandFromString("9AJQK"), [false, true, true, true, false])).toBe(0);
    //Unsuited hand is not a royal flush
    expect(calc.countOutsForRoyalFlush(getHandFromString("9AJQK"), [false, true, true, true, true])).toBe(0);
    //Straight flush is not necessarily a royal flush
    expect(calc.countOutsForRoyalFlush(getSuitedHandFromString("9TJQA"), [true, true, true, true, false])).toBe(0);
})