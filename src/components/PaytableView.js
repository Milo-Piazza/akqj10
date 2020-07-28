import React, { Component } from 'react';
import "../styles/paytables.css";

class PaytableView extends Component {
    constructor(props) {
        super(props);
        this.paytable = props.paytable;
    }

    render() {
        const hands = this.paytable.hands;
        return (
        <table className="paytable">
            <tr>
                {["Hand", 1, 2, 3, 4, 5].map((item) => <th key={"paytableHeader" + item.toString()}>{item}</th>)}
            </tr>
            {hands.map((hand) => <tr key={hand.name + "row"} className={hand.name === this.props.hand ? "winning-hand" : ""}>
                <td key={hand.name + "Header"}>{hand.name}</td>
                {[1, 2, 3, 4, 5].map((bet) => <td key={hand.name + bet.toString()}>{hand.pays(bet)}</td>)}
            </tr>)}
        </table>);
    }
}

export default PaytableView;