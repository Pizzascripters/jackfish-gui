import React from 'react';
import './style.css';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    window.grayAction = (action) => {
      let elem = document.getElementById(`button${action}`);
      if(elem) {
        elem.className = 'gray';
      }
    }

    window.activateAction = (action) => {
      let elem = document.getElementById(`button${action}`);
      if(elem) {
        elem.className = '';
      }
    }
  }

  act(action) {
    window.doAction(action);
  }

  bet(bet) {
    window.addBet(bet);
  }

  render() {
    return <div id='game'>
      <canvas id='cvs'></canvas>
      <div id='chips'>
        <img src='img/chips/clear.png' alt='Clear Bet' onClick={this.bet.bind(this, 0)} width='64' height='64' />
        <img src='img/chips/1.png' alt='Bet 1' onClick={this.bet.bind(this, 1)} width='64' height='64' />
        <img src='img/chips/5.png' alt='Bet 5' onClick={this.bet.bind(this, 5)} width='64' height='64' />
        <img src='img/chips/10.png' alt='Bet 10' onClick={this.bet.bind(this, 10)} width='64' height='64' />
        <img src='img/chips/25.png' alt='Bet 25' onClick={this.bet.bind(this, 25)} width='64' height='64' />
        <img src='img/chips/100.png' alt='Bet 100' onClick={this.bet.bind(this, 100)} width='64' height='64' />
        <img src='img/chips/500.png' alt='Bet 500' onClick={this.bet.bind(this, 500)} width='64' height='64' />
      </div>
      <div id='actions'>
        <button id='buttonR' onClick={this.act.bind(this, 'Surrender')}>Surrender</button>
        <button id='buttonD' onClick={this.act.bind(this, 'Double')}>Double</button>
        <button id='buttonS' onClick={this.act.bind(this, 'Stand')}>Stand</button>
        <button id='buttonH' onClick={this.act.bind(this, 'Hit')}>Hit</button>
        <button id='buttonP' onClick={this.act.bind(this, 'Split')}>Split</button>
        <button id='buttonI' onClick={this.act.bind(this, 'Insurance')}>Insurance</button>
      </div>
    </div>
  }
}

export default Game;
