import React, { Component } from 'react';
import Paytable from '../model/Paytable';
import PaytableView from './PaytableView';
import Deck from "../model/Deck";
import "../styles/pokergame.css";

var cardImages = require.context("../../public/cards/", true);

class PokerGame extends Component {

    static paytable = new Paytable();

    constructor(props) {
        super(props);
        this.deck = new Deck();
        this.state = {  
            gameState: "DEAL",
            hand: "Nothing",
            cards: [],
            held: [false, false, false, false, false],
            bet: 1,
            pays: 0,
            chips: 100
        }
        this.handleDeal = this.handleDeal.bind(this);
        this.handleDraw = this.handleDraw.bind(this);
        this.handleBetMax = this.handleBetMax.bind(this);
        this.handleBetOne = this.handleBetOne.bind(this);
        this.updateHand = this.updateHand.bind(this);
        this.getCardImageCode = this.getCardImageCode.bind(this);
    }

    handleDeal() {
        this.deck.reset();
        var new_cards = [];
        for (let i = 0; i < 5; i++) {
            let card = this.deck.drawCard();
            new_cards.push(card);
        }
        this.updateHand(new_cards, () => {        
            this.setState((state) => ({
            gameState: "DRAW",
            held: [false, false, false, false, false],
            chips: state.chips - state.bet }))
        });
    }

    handleDraw() {
        var new_cards = this.state.cards;
        for (let i = 0; i < this.state.held.length; i++) {
            if (!this.state.held[i]) {
                var new_card = this.deck.drawCard();
                new_cards[i] = new_card;
            }
        }
        this.updateHand(new_cards, () => {        
            this.setState((state) => ({
            gameState: "DEAL",
            chips: state.chips + state.pays }))
        });
    }

    handleBetOne() {
        if (this.state.gameState === "DEAL") {
            this.setState((state) => ({
                bet: state.bet % 5 + 1
            }))
        }
    }

    handleBetMax() {
        if (this.state.gameState === "DEAL") {
            this.setState({
                bet: 5
            }, () => this.handleDeal());
        }
    }

    updateHand(newCards, callback = () => {}) {
        let newHand = this.constructor.paytable.evaluateHand(newCards, this.state.bet);
        this.setState({
            cards: newCards,
            hand: newHand.name,
            pays: newHand.pays
        }, callback);
    }

    handleHoldChange = (i) => {
        if (this.state.gameState === "DRAW") {
            this.setState((state) => ({
                held: state.held.map((isHeld, index) => i === index ? !isHeld : isHeld)
            }))
        }
    }

    getCardImageCode(card) {
        return card.rank.toString() + card.suit[0];
    }

    getCardImage(i) {
        if (this.state.cards.length === 0) {
            return <img className="card" key={"card" + i.toString()} src={cardImages("./red_back.png")}></img>
        }
        var card = this.state.cards[i];
        return <img onClick={() => this.handleHoldChange(i)} className="card" key={"card" + i.toString()} src={cardImages("./" + this.getCardImageCode(card) + ".png")}></img>
    }

    render() { 
        return <div className="pokerGame">
            <PaytableView className="paytable gameItem" hand={this.state.hand} paytable={this.constructor.paytable}></PaytableView>
            <div className="cards">
                {[0,1,2,3,4].map((i) =><div className="cardAndHold gameItem">
                    {this.getCardImage(i)}
                    <button className={this.state.held[i] ? "heldButton" : "holdButton"} key={"button" + i.toString()} onClick={() => this.handleHoldChange(i)}>{this.state.held[i] ? "HELD" : "HOLD"}</button>
                </div>)}
            </div>
            <div className="handNotifier">
                {this.state.pays > 0 ? this.state.hand + ": Pays " + this.state.pays : null}
            </div>
            <div className="betButtons gameItem">
                <p className="chipCounter">Chips: {this.state.chips} Bet: {this.state.bet}</p>
                <button className="betButton" onClick={this.handleBetOne}>BET ONE</button>
                <button className="betButton" onClick={this.handleBetMax}>BET MAX</button>
                <button className={this.state.gameState === "DEAL" ? "betButton" : "drawButton"} onClick={() => (this.state.gameState === "DEAL" ? this.handleDeal() : this.handleDraw())}>{this.state.gameState}</button>
            </div>
        </div>;
    }
}
 
export default PokerGame;