module.exports = class Paytable {

    static rankComparison = {
        "2": 0,
        "3": 1,
        "4": 2,
        "5": 3,
        "6": 4,
        "7": 5,
        "8": 6,
        "9": 7,
        "T": 8,
        "J": 9,
        "Q": 10,
        "K": 11,
        "A": 12,
        "Joker": 13
    }

    constructor() {
        this.hands = [
            {
                pays: (bet) => bet === 5 ? bet * 800 : bet * 250,
                name: "Royal Flush",
                condition: this.isRoyalFlush
            },
            {
                pays: (bet) => bet * 50,
                name: "Straight Flush",
                condition: this.isStraightFlush
            },
            {
                pays: (bet) => bet * 25,
                name: "Four of a Kind",
                condition: this.isFourOfAKind
            },
            {
                pays: (bet) => bet * 9,
                name: "Full House",
                condition: this.isFullHouse
            },
            {
                pays: (bet) => bet * 6,
                name: "Flush",
                condition: this.isFlush
            },
            {
                pays: (bet) => bet * 4,
                name: "Straight",
                condition: this.isStraight
            },
            {
                pays: (bet) => bet * 3,
                name: "Three of a Kind",
                condition: this.isThreeOfAKind
            },
            {
                pays: (bet) => bet * 2,
                name: "Two Pair",
                condition: this.isTwoPair
            },
            {
                pays: (bet) => bet * 1,
                name: "Jacks or Better",
                condition: this.isJacksOrBetter
            },
        ]
    }

    getPayForHand(hand, bet) {
        for (let handType of this.hands) {
            if (handType.condition(hand)) {
                return handType.pays(bet);
            }
        }
        return 0;
    }

    isRoyalFlush(hand) {
        if (!this.isStraightFlush(hand)) {
            return false;
        }
        const pures = this.constructor.removeWilds(hand);
        for (const card of pures) {
            //If non-wild card has a rank of less than 10
            if (this.constructor.rankComparison[card.rank] < 8) {
                return false;
            }
            //We don't worry about duplicates because the hand is already a straight flush,
            //implying it has no duplicates.
        }
        return true;
    }

    isStraightFlush(hand) {
        return this.isStraight(hand) && this.isFlush(hand);
    }

    isFourOfAKind(hand) {
        const pures = this.constructor.removeWilds(hand);
        const wildCount = hand.length - pures.length;
        const counts = this.constructor.countRanks(pures);
        for (const rank of Object.keys(counts)) {
            if (counts[rank] + wildCount >= 4) {
                return true;
            }
        }
        return false;
    }

    isFullHouse(hand) {
        const pures = this.constructor.removeWilds(hand);
        const counts = this.constructor.countRanks(pures);
        //If there are at least 3 wilds or only one rank the hand is a four/five-of-a-kind.
        return (Object.keys(counts).length === 2);
    }

    isFlush(hand) {
        const pures = this.constructor.removeWilds(hand);
        if (pures.length === 0) {
            return true;
        }
        const suit = pures[0].suit;
        for (const card of pures) {
            if (card.suit !== suit) {
                return false
            }
        }
        return true;
    }

    isStraight(hand) {
        const pures = this.constructor.removeWilds(hand);
        if (pures.length <= 1) {
            return true;
        }
        pures.sort(this.constructor.rankComparator);
        const counts = this.constructor.countRanks(pures);
        for (const rank of Object.keys(counts)) {
            if (counts[rank] > 1) {
                return false;
            }
        }
        const maxRank = pures[pures.length - 1].rank;
        const minRank = pures[0].rank;
        //Handle the special case of an A2345 straight
        //It suffices to assume a non-wild ace is present, since
        //the normal straight handling will work otherwise.
        if (maxRank === "A") {
            const secondRank = pures[pures.length - 2].rank;
            //If the second largest rank is <= 5
            if (this.constructor.rankComparison[secondRank] <= 3) {
                return true;
            }
        }
        //The non-wilds must have a range of no more than 4.
        return (this.constructor.rankComparison[maxRank] - this.constructor.rankComparison[minRank] <= 4)
    }

    isThreeOfAKind(hand) {
        const pures = this.constructor.removeWilds(hand);
        const wildCount = hand.length - pures.length;
        const counts = this.constructor.countRanks(pures);
        for (const rank of Object.keys(counts)) {
            if (counts[rank] + wildCount >= 3) {
                return true;
            }
        }
        return false;
    }

    isTwoPair(hand) {
        const pures = this.constructor.removeWilds(hand);
        const wildCount = hand.length - pures.length;
        const counts = this.constructor.countRanks(pures);
        let pairs = 0;
        for (const rank of Object.keys(counts)) {
            if (counts[rank] >= 2) {
                pairs++;
            }
        }
        //If there are k wilds, then there must be 2-k natural pairs.
        return pairs + wildCount >= 2;
    }

    isJacksOrBetter(hand) {
        const pures = this.constructor.removeWilds(hand);
        const wildCount = hand.length - pures.length;
        const counts = this.constructor.countRanks(pures);
        for (const [rank, count] of Object.entries(counts)) {
            if (this.constructor.rankComparison[rank] >= 9 && count + wildCount >= 2) {
                return true;
            }
        }
        return false;
    }

    static isWild(card) {
        return false;
    }

    static removeWilds(hand) {
        return hand.filter((card) => !this.isWild(card));
    }

    static rankComparator = (card1, card2) => this.rankComparison[card1.rank] - this.rankComparison[card2.rank]

    static countRanks(hand) {
        var counts = {};
        for (const card of hand) {
            let rank = card.rank;
            if (rank in counts) {
                counts[rank] += 1;
            } else {
                counts[rank] = 1;
            }
        }
        return counts;
    }
}