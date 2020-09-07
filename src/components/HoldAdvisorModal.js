import React, { Component } from 'react';
import "../styles/holdadvisor.css";
import _ from "lodash";

class HoldAdvisorModal extends Component {
    constructor(props) {
        super(props);
        this.holdCalculator = this.props.holdCalculator;
    }

    getHoldMessage(hand, hold, message, the_return=0) {
        return <p className="holdMessage">{message} {hand.map((x, i) => {return this.getHTMLForCard(x, hold[i])})} {"Expected return: "}{the_return.toFixed(3)}</p>
    }

    getHTMLForCard(card, isHeld) {
        var the_style = {};
        if (card.suit === "Hearts" || card.suit === "Diamonds") {
            the_style['color'] = 'red';
        } else {
            the_style['color'] = 'black';
        }
        if (isHeld) {
            the_style['border-style'] = 'solid';
            the_style['border-color'] = '#dddddd';
            the_style['border-width'] = '0px 0px 2px 0px';
        }
        return <span style={the_style}>{card.rank}{this.suitToCode(card.suit)}</span>
    }

    suitToCode(suit) {
        return {
            "Hearts": "\u2665",
            "Spades": "\u2660",
            "Diamonds": "\u2666",
            "Clubs": "\u2663"
        }[suit] || "";
    }

    render() { 
        if (!this.props.show) {
            return null;
        }
        let holdInfo = this.holdCalculator.getOptimalHold(this.props.hand, this.props.bet);
        let currReturn = this.holdCalculator.getExpectedReturnForHold(this.props.hand, this.props.hold, this.props.bet);
        let optimalHold = holdInfo["hold"];
        let optimalReturn = holdInfo["return"];
        if (!_.isEqual(optimalHold, this.props.hold)) {
            return <div className="holdAdvisor">
                <p>Try this next time...</p>
                {this.getHoldMessage(this.props.hand, this.props.hold, "Your hold:", currReturn)}
                {this.getHoldMessage(this.props.hand, optimalHold, "Optimal hold:", optimalReturn)}
            </div>
        }
        return null;
    }
}
 
export default HoldAdvisorModal;