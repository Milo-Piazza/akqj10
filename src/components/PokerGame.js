import React, { Component } from 'react';
import Deck from '../model/Deck';
import Paytable from '../model/Paytable';
import PaytableView from './PaytableView';
import "../styles/pokergame.css";

var cardImages = require.context("../../public/cards/", true);
console.log(cardImages);

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
        this.updateHand(new_cards);
        this.setState((state) => ({
            gameState: "DRAW",
            held: [false, false, false, false, false],
            chips: state.chips - state.bet
        }))
    }

    handleDraw() {
        var new_cards = this.state.cards;
        for (let i = 0; i < this.state.held.length; i++) {
            if (!this.state.held[i]) {
                var new_card = this.deck.drawCard();
                new_cards[i] = new_card;
            }
        }
        this.updateHand(new_cards);
        this.setState((state) => ({
            gameState: "DEAL",
            chips: state.chips + state.pays
        }))
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
            })
        }
        this.handleDeal();
    }

    updateHand(newCards) {
        let newHand = this.constructor.paytable.evaluateHand(newCards, this.state.bet);
        this.setState((state) => ({
                cards: newCards,
                hand: newHand.name,
                pays: newHand.pays
            })
        );
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

    getCardImages() {
        if (this.state.cards.length === 0) {
            return [0,1,2,3,4].map((i) => <img className="card" key={"card" + i.toString()} src={cardImages("./red_back.png")}></img>)
        }
        return this.state.cards.map((card, i) => <img onClick={() => this.handleHoldChange(i)} className="card" key={"card" + i.toString()} src={cardImages("./" + this.getCardImageCode(card) + ".png")}></img>)
    }

    render() { 
        return <div className="pokerGame">
            <PaytableView className="paytable gameItem" hand={this.state.hand} paytable={this.constructor.paytable}></PaytableView>
            <div className="cards gameItem">
                {this.getCardImages()}
            </div>
            <div className="buttons gameItem">
                {[0,1,2,3,4].map((index) => (
                    <button className="holdButton" key={"button" + index.toString()} onClick={() => this.handleHoldChange(index)}>{this.state.held[index] ? "HELD" : "HOLD"}</button>
                ))}
            </div>
            <div className="buttons gameItem">
                <button onClick={() => (this.state.gameState === "DEAL" ? this.handleDeal() : this.handleDraw())}>{this.state.gameState}</button>
                <button onClick={this.handleBetOne}>BET ONE</button>
                <button onClick={this.handleBetMax}>BET MAX</button>
            </div>
            <p>Chips: {this.state.chips} Bet: {this.state.bet}</p>
        </div>;
    }
}
 
export default PokerGame;