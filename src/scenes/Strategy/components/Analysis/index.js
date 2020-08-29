import React from 'react';
import {stateToName, formatPercent, formatMove} from '../../../../lib/lib.js';
import Actions from '../../../../components/Actions';
import Insurance from '../../../../components/Insurance';
import './style.css';

class Analysis extends React.Component {
  constructor(props) {
    super(props);
    this.jackfishListener = () => {
      if(this.mounted) this.forceUpdate();
    }
    this.listener = window.jackfish.addListener('doAll', this.jackfishListener);
  }

  componentWillUnmount() {
    window.jackfish.removeListener(this.listener);
  }

  componentDidMount() {
    this.mounted = true;
  }

  render() {
    if(window.jackfish.isLoaded()) {
      let props = this.props;
      if(props.selection) {
        return <div id='analysis' className='section'>
          <BoxHeader selection={props.selection}/>
          <BestMove selection={props.selection} />
          <Dealer selection={props.selection} />
          <Actions selection={props.selection} surrender={window.jackfish.getParams().surrender} />
        </div>;
      } else {
        return <div id='analysis' className='section'>
          <MainHeader />
          <Insurance yes={window.jackfish.takeInsurance()} />
          <Edge />
        </div>;
      }
    } else {
      return <div id='analysis' className='section'></div>
    }

  }
}

function MainHeader(props) {
  let params = window.jackfish.getParams();
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

function Edge(props) {
  return <div id='edge'>
    Player Edge: <br />
    {formatPercent(window.jackfish.getEdge(), true)}
  </div>;
}

function BoxHeader(props) {
  return <div id='header'>
    {stateToName(props.selection[0], true)} vs Dealer {stateToName(props.selection[1], true)}
  </div>
}

function BestMove(props) {
  let jackfish = window.jackfish;
  let player = props.selection[0];
  let dealer = props.selection[1];
  let move = jackfish.getTable(player, dealer);
  let action = (move.surrender ? 'R' : '') + move.action;
  return <div className='bestmove'>{formatMove(action)}</div>;
}

function Dealer(props) {
  let jackfish = window.jackfish;
  let peek = window.jackfish.getParams().peek;
  let card = props.selection[1];
  let odds = [
    jackfish.getEnd(card, 17) + jackfish.getEnd(card, 0x20+17),
    jackfish.getEnd(card, 18) + jackfish.getEnd(card, 0x20+18),
    jackfish.getEnd(card, 19) + jackfish.getEnd(card, 0x20+19),
    jackfish.getEnd(card, 20) + jackfish.getEnd(card, 0x20+20),
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

export default Analysis;
