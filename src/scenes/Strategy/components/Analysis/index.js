import React from 'react';
import {stateToName, formatPercent} from '../../../../lib/lib.js';
import './style.css';

let actionNames = {
  'H': <span className="red">Hit</span>,
  'S': <span className="yellow">Stand</span>,
  'DD': <span className="blue">Double</span>,
  'P': <span className="green">Split</span>,
  'R': <span className="white">Surrender</span>,
}
const ACTION_NAMES = Object.assign(actionNames, {
  'D': <span>{actionNames['DD']}, otherwise {actionNames['H']}</span>,
  'd': <span>{actionNames['DD']}, otherwise {actionNames['S']}</span>,
  'RH': <span>{actionNames['R']}, otherwise {actionNames['H']}</span>,
  'RS': <span>{actionNames['R']}, otherwise {actionNames['S']}</span>,
  'RP': <span>{actionNames['R']}, otherwise {actionNames['P']}</span>,
});

function Analysis(props) {
  if(props.selection) {
    return <div id='analysis' className='section'>
      <BoxHeader selection={props.selection}/>
      <BestMove jackfish={props.jackfish} selection={props.selection} />
      <Dealer jackfish={props.jackfish} selection={props.selection} />
      <Actions jackfish={props.jackfish} selection={props.selection} surrender={props.jackfish.getParams().surrender} />
    </div>;
  } else {
    return <div id='analysis' className='section'>
      <MainHeader jackfish={props.jackfish} />
      <Insurance jackfish={props.jackfish} />
      <Edge jackfish={props.jackfish} />
    </div>;
  }
}

function MainHeader(props) {
  let params = props.jackfish.getParams();
  let surrender = null;
  if(params.surrender === 'early') {
    surrender = <div className='small'>Early Surrender Allowed</div>
  } else if(params.surrender === 'late') {
    surrender = <div className='small'>Late Surrender Allowed</div>
  }
  return <div id='header' className='bottomMargin'>
    {params.soft17 ? 'Dealer Hits Soft 17' : 'Dealer Stands on 17'}
    <div className='small'>{params.blackjack === 1.5 ? 'Blackjack pays 3:2' : 'Blackjack pays 6:5'}</div>
    {surrender}
    {params.split.double ? null : <div className='small'>No Double After Split</div>}
  </div>;
}

function Insurance(props) {
  let insurance;
  if(props.jackfish.takeInsurance()) {
    insurance = <div className='green'>Yes</div>
  } else {
    insurance = <div className='red'>No</div>
  }

  return <div id='insurance'>
    Take Insurance?
    {insurance}
  </div>;
}

function Edge(props) {
  return <div id='edge'>
    Player Edge: <br />
    {formatPercent(props.jackfish.getEdge(), true)}
  </div>;
}

function BoxHeader(props) {
  return <div id='header'>
    {stateToName(props.selection[0], true)} vs Dealer {stateToName(props.selection[1], true)}
  </div>
}

function BestMove(props) {
  let jackfish = props.jackfish;
  let player = props.selection[0] & 0x3f;
  let dealer = props.selection[1];
  let pair = props.selection[0] & 0x40;
  let move = jackfish.bestMove(player, dealer, pair);
  let action = (move.surrender ? 'R' : '') + move.action;
  return <div className='bestmove'>{ACTION_NAMES[action]}</div>;
}

function Dealer(props) {
  let jackfish = props.jackfish;
  let peek = props.jackfish.getParams().peek;
  let card = props.selection[1];
  let odds = [
    jackfish.getEnd(card, 17) + jackfish.getEnd(card, 32+17),
    jackfish.getEnd(card, 18) + jackfish.getEnd(card, 32+18),
    jackfish.getEnd(card, 19) + jackfish.getEnd(card, 32+19),
    jackfish.getEnd(card, 20) + jackfish.getEnd(card, 32+20),
    jackfish.getEnd(card, 21),
    jackfish.getEnd(card, -2),
  ];
  let labels = [17, 18, 19, 20, 21, 'Bust'];
  if(!peek) {
    odds.splice(5, 0, jackfish.getEnd(card, -1));
    labels.splice(5, 0, 'Blackjack');
  }
  return <div className='dealerInfo'>
    <div>Dealer {stateToName(props.selection[1], true)}:</div>
    {labels.map((label, i) => {
      return <div key={i}>{label}: {formatPercent(odds[i])}</div>
    })}
  </div>
}

function Actions(props) {
  if(props.selection) {
    let jackfish = props.jackfish;
    let peek = jackfish.getParams().peek;
    let player = props.selection[0];
    let dealer = props.selection[1];
    let value = player & 0x3f
    let pair = player & 0x40;
    let ret;
    if(pair) {
      let pre = value === 43 ? 44 : 2*value; // Value before splitting
      ret = [
        jackfish.getHit(pre, dealer),
        jackfish.getStand(pre, dealer),
        jackfish.getDouble(pre, dealer),
        jackfish.getSplit(value, dealer),
      ];
    } else {
      ret = [
        jackfish.getHit(value, dealer),
        jackfish.getStand(value, dealer),
        jackfish.getDouble(value, dealer)
      ];
    }
    if(props.surrender === 'late' || (!peek && props.surrender === 'early')) {
      ret[4] = -.5;
    } else if(props.surrender === 'early') {
      let b = jackfish.getBJOdds(dealer);
      ret[4] = (b - .5) / (1 - b);
    }
    let labels = [actionNames['H'], actionNames['S'], actionNames['DD'], actionNames['P'], actionNames['R']];
    return <div className='actionInfo'>
      <div>Actions:</div>
      {ret.map((p, i) => {
        if(p && p > -Infinity) {
          return <div key={i}>{labels[i]}: {formatPercent(p, true)}</div>
        } else {
          return null;
        }
      })}
    </div>
  }
  return null;
}

export default Analysis;
