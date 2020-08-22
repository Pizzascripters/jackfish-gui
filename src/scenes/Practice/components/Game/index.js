import React from 'react';
import './style.css';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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
        <button onClick={this.act.bind(this, 'Surrender')}>Surrender</button>
        <button onClick={this.act.bind(this, 'Stand')}>Stand</button>
        <button onClick={this.act.bind(this, 'Hit')}>Hit</button>
        <button onClick={this.act.bind(this, 'Double')}>Double</button>
        <button onClick={this.act.bind(this, 'Split')}>Split</button>
      </div>
    </div>
  }
}

export default Game;
