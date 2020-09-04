import {choose} from "../utils/math";

class HoldCalculator {

    constructor(deck, paytable) {
        this.deck = deck;
        this.paytable = paytable;
        this.outCounters = {
            "Jacks or Better": this.countOutsForJacksOrBetter.bind(this),
            "Two Pair": this.countOutsForTwoPair.bind(this),
            "Three of a Kind": this.countOutsForThreeOfAKind.bind(this),
            "Straight": this.countOutsForStraight.bind(this),
            "Flush": this.countOutsForFlush.bind(this),
            "Full House": this.countOutsForFullHouse.bind(this),
            "Four of a Kind": this.countOutsForFourOfAKind.bind(this),
            "Straight Flush": this.countOutsForStraightFlush.bind(this),
            "Royal Flush": this.countOutsForRoyalFlush.bind(this)
        };
    }

    getOptimalHold(cards, bet=5) {
        var maxReturn = 0;
        var currentReturn;
        var bestHold = [false, false, false, false, false];
        var currentHold = [false, false, false, false, false];
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 5; j++) {
                currentHold[j] = Boolean((i >> j) & 1);
                currentReturn = this.getExpectedReturnForHold(cards, currentHold, bet);
                if (currentReturn > maxReturn) {
                    maxReturn = currentReturn;
                    bestHold = currentHold.slice();
                }
            }
        }
        return {hold: bestHold, return: maxReturn};
    }

    getExpectedReturnForHold(cards, hold, bet=5) {
        var pays = this.getPays(bet);
        var numCardsHeld = hold.filter(x => x).length;
        if (numCardsHeld === 5) {
            return this.paytable.evaluateHand(cards, bet);
        }
        var expectedReturn = 0;
        for (let handName in pays) {
            var outs = this.outCounters[handName](cards, hold);
            expectedReturn += outs * pays[handName];
        }
        expectedReturn /= choose(this.deck.cardCount - 5, 5 - numCardsHeld);
        return expectedReturn;
    }

    getPays(bet) {
        var hands = this.paytable.hands;
        var pays = {};
        for (const hand of hands) {
            let name = hand.name;
            let pay = hand.pays(bet);
            pays[name] = pay;
        }
        return pays;
    }
    
    //TODO: Incorporate wild counting

    countOutsForJacksOrBetter(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var deckRanks = this.countRanksInDeck(cards);
        var draws = this.getDiscardedCards(cards, hold).length;
        var ranksHeld = this.countRanks(heldCards);
        var highPair = null;
        var ranksToDraw = Object.assign({}, deckRanks);
        for (let rank in ranksHeld) {
            if (ranksHeld[rank] > 2) {
                return 0;
            }
            if (ranksHeld[rank] === 2) {
                if (highPair || this.paytable.constructor.rankComparison[rank] < this.paytable.constructor.rankComparison["J"]) {
                    return 0;
                }
                highPair = rank;
            }
            delete ranksToDraw[rank];
        }
        var outs = 0;
        for (let i = this.paytable.constructor.rankComparison["J"]; i < this.deck.constructor.ranks.length; i++) {
            let rank = this.deck.constructor.ranks[i];
            if (highPair && rank !== highPair) {
                continue;
            }
            let hits = 2 - (ranksHeld[rank] || 0);
            if (hits >= 0 && draws - hits >= 0) {
                outs += choose(deckRanks[rank], hits) * this.countDistinctRankDraws(ranksToDraw, draws - hits);
            }
        }
        return outs;
    }

    countDistinctRankDraws(rankCount, k) {
        let ranks = Object.keys(rankCount);
        function _count(i, k) {
            if (ranks.length - i < k) {
                return 0;
            } 
            if (k === 0) {
                return 1;
            }
            const rank = ranks[i];
            return rankCount[rank] * _count(i+1, k-1) + _count(i+1, k);
        }
        return _count(0, k);
    }

    countOutsForTwoPair(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var deckRanks = this.countRanksInDeck(cards);
        var draws = this.getDiscardedCards(cards, hold).length;
        var ranksHeld = this.countRanks(heldCards);
        var outs = 0;
        for (let i1 = 0; i1 < this.deck.constructor.ranks.length; i1++) {
            for (let i2 = i1+1; i2 < this.deck.constructor.ranks.length; i2++) {
                let rank1 = this.deck.constructor.ranks[i1];
                let rank2 = this.deck.constructor.ranks[i2];
                let hits1 = 2 - (ranksHeld[rank1] || 0);
                let hits2 = 2 - (ranksHeld[rank2] || 0);
                if (hits1 >= 0 && hits2 >= 0) {
                    outs += choose(deckRanks[rank1], hits1) * choose(deckRanks[rank2], hits2) * choose(this.deck.cardCount - 5 - deckRanks[rank1] - deckRanks[rank2], draws - hits1 - hits2);
                }
            }
        }
        return outs;
    }

    countOutsForThreeOfAKind(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var deckRanks = this.countRanksInDeck(cards);
        var draws = this.getDiscardedCards(cards, hold).length;
        var ranksHeld = this.countRanks(heldCards);
        var outs = 0;
        for (let rank of this.deck.constructor.ranks) {
            let hits = 3 - (ranksHeld[rank] || 0);
            if (hits >= 0) {
                outs += choose(deckRanks[rank], hits) * choose(this.deck.cardCount - 5 - deckRanks[rank], draws - hits)
            }
        }
        outs -= this.countOutsForFullHouse(cards, hold);
        return outs;
    }

    countOutsForStraight(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var heldRanks = new Set();
        var rank;
        for (let card of heldCards) {
            rank = this.paytable.constructor.rankComparison[card.rank];
            if (rank in heldRanks) {
                //Cannot draw a straight if we hold a pair or more
                return 0;
            }
            heldRanks.add(rank);
        }
        var rankCount = this.countRankIndicesInDeck(cards);
        var outs = 0;
        var currentOuts;
        //Handle 5-high straight as a special case
        var straightRanks = new Set([12, 0, 1, 2, 3]);
        for (let highRank = 4; highRank <= 13; highRank += 1) {
            currentOuts = 1;
            for (let rank of heldRanks) {
                if (!(straightRanks.has(rank))) {
                    currentOuts = 0;
                    break;
                }
            }
            if (currentOuts !== 0) {
                for (let rank of straightRanks) {
                    if (!(heldRanks.has(rank))) {
                        currentOuts *= rankCount[rank];
                    }
                }
            }
            outs += currentOuts;
            straightRanks.delete(highRank - 5);
            straightRanks.delete(12);
            straightRanks.add(highRank);
        }
        outs -= this.countOutsForStraightFlush(cards, hold) + this.countOutsForRoyalFlush(cards, hold);
        return outs;
    }

    countOutsForFlush(cards, hold) {
        var outs = 0;
        var heldCards = this.getHeldCards(cards, hold);
        var discardedCards = this.getDiscardedCards(cards, hold);
        var suitCount = this.countSuitsInDeck(cards, hold);
        var suits;
        if (!this.cardsAreSuited(heldCards)) {
            return 0;
        } else if (heldCards.length === 0) {
            suits = this.deck.constructor.suits;
        } else {
            suits = [heldCards[0].suit];
        }
        for (let suit of suits) {
            outs += choose(suitCount[suit], discardedCards.length)
        }
        outs -= this.countOutsForStraightFlush(cards, hold) + this.countOutsForRoyalFlush(cards, hold);
        return outs;
    }

    countOutsForFullHouse(cards, hold) {
        var ranksHeld = this.countRanks(this.getHeldCards(cards, hold));
        var deckRanks = this.countRanksInDeck(cards);
        var draws = this.getDiscardedCards(cards, hold).length;
        var outs = 0;
        for (let over of this.deck.constructor.ranks) {
            for (let under of this.deck.constructor.ranks) {
                if (over === under) {
                    continue;
                }
                let toDrawOver = 3 - (ranksHeld[over] || 0);
                let toDrawUnder = 2 - (ranksHeld[under] || 0);
                if (toDrawOver + toDrawUnder === draws) {
                    outs += choose(deckRanks[over], toDrawOver) * choose(deckRanks[under], toDrawUnder);
                }
            }
        }
        return outs;
    }

    countOutsForFourOfAKind(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var deckRanks = this.countRanksInDeck(cards);
        var draws = this.getDiscardedCards(cards, hold).length;
        var ranksHeld = this.countRanks(heldCards);
        var outs = 0;
        for (let rank of this.deck.constructor.ranks) {
            let hits = 4 - (ranksHeld[rank] || 0);
            outs += choose(deckRanks[rank], hits) * choose(this.deck.cardCount - 5 - deckRanks[rank], draws - hits)
        }
        return outs;
    }

    countOutsForStraightFlush(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var discardedCards = this.getDiscardedCards(cards, hold);
        var suits;
        if (heldCards.length === 0) {
            suits = this.deck.constructor.suits;
        } else if (!this.cardsAreSuited(heldCards)) {
            return 0;
        } else {
            suits = [heldCards[0].suit];
        }
        var outs = 0;
        //Handle 5-high straight as a special case
        var ranks = new Set([12, 0, 1, 2, 3]);
        var flag;
        for (let highRank = 4; highRank <= 12; highRank += 1) {
            for (let suit of suits) {
                flag = true;
                for (let card of heldCards) {
                    if (card.suit !== suit || !ranks.has(this.paytable.constructor.rankComparison[card.rank])) {
                        flag = false;
                        break;
                    }
                }
                for (let card of discardedCards) {
                    if (card.suit === suit && ranks.has(this.paytable.constructor.rankComparison[card.rank])) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    outs += 1;
                }
            }
            ranks.delete(highRank - 5);
            ranks.delete(12);
            ranks.add(highRank);
        }
        return outs;
    }

    countOutsForRoyalFlush(cards, hold) {
        var heldCards = this.getHeldCards(cards, hold);
        var discardedCards = this.getDiscardedCards(cards, hold);
        var suits;
        if (heldCards.length === 0) {
            suits = this.deck.constructor.suits;
        } else if (!this.cardsAreSuited(heldCards)) {
            return 0;
        } else {
            suits = [heldCards[0].suit];
        }
        var outs = 0;
        var flag;
        for (let suit of suits) {
            flag = true;
            for (let card of heldCards) {
                if (card.suit !== suit || this.paytable.constructor.rankComparison[card.rank] < 8) {
                    flag = false;
                    break;
                }
            }
            for (let card of discardedCards) {
                if (card.suit === suit && this.paytable.constructor.rankComparison[card.rank] >= 8) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                outs += 1;
            }
        }
        return outs;
    }

    countRanksInDeck(cardsDrawn) {
        var rankCount = Object.assign({}, this.deck.rankCount);
        for (let card of cardsDrawn) {
            rankCount[card.rank] -= 1;
        }
        return rankCount;
    }

    countRankIndicesInDeck(cardsDrawn) {
        var rankCount = this.countRanksInDeck(cardsDrawn);
        var res = {};
        for (let rank in rankCount) {
            res[this.paytable.constructor.rankComparison[rank]] = rankCount[rank];
        }
        return res;
    }

    countSuitsInDeck(cardsDrawn) {
        var suitCount = Object.assign({}, this.deck.suitCount);
        for (let card of cardsDrawn) {
            if (card.suit in suitCount) {
                suitCount[card.suit] -= 1;
            }
        }
        return suitCount;
    }

    countRanks(hand) {
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

    getHeldCards(cards, hold) {
        return cards.filter((x,i) => hold[i]);
    }

    getDiscardedCards(cards, hold) {
        return cards.filter((x,i) => !hold[i]);
    }

    cardsAreSuited(cards) {
        if (cards.length === 0) {
            return true; //TODO: figure out best way to handle this edge case
        }
        var suit = cards[0].suit;
        for (let card of cards) {
            if (card.suit !== suit) {
                return false;
            }
        }
        return true;
    }
}

export default HoldCalculator;