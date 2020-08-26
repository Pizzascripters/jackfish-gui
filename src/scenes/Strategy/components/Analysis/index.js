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
    props.jackfish.addListener(this.jackfishListener);
  }

  componentWillUnmount() {
    this.props.jackfish.removeListener(this.jackfishListener);
  }

  componentDidMount() {
    this.mounted = true;
  }

  render() {
    if(this.props.jackfish.isLoaded()) {
      let props = this.props;
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
          <Insurance yes={props.jackfish.takeInsurance()} />
          <Edge jackfish={props.jackfish} />
        </div>;
      }
    } else {
      return <div id='analysis' className='section'></div>
    }

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
  let player = props.selection[0];
  let dealer = props.selection[1];
  let move = jackfish.getTable(player, dealer);
  let action = (move.surrender ? 'R' : '') + move.action;
  return <div className='bestmove'>{formatMove(action)}</div>;
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

export default Analysis;
