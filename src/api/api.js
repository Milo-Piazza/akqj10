const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();

const Deck = require("./Deck.js");

const decks = {
    "standard": Deck
}

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.post("/cards", (req, res) => {
    var numCardsToDraw = req.body.drawCount || 1;
    var alreadyDrawn = req.body.drawn || [];
    alreadyDrawn = new Set(alreadyDrawn);
    var newCards = [];
    var deckType = req.body.deck || "standard";
    var deck = getDeckFromType(deckType);
    while (newCards.length < numCardsToDraw) {
        //use rejection sampling to draw cards
        card = deck.drawCard();
        if (!(alreadyDrawn.has(card))) {
            alreadyDrawn.add(card);
            newCards.push(card);
        }
    }
    res.send({cards: newCards});
})

function getDeckFromType(deckType) {
    if (!(deckType in decks)) {
        console.log("Warning: " + deckType + " not a valid deck type");
        return Deck()
    }
    return new decks[deckType]()
}

app.listen(3000);