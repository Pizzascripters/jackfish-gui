import React from 'react';
import {stateToName} from '../../../../lib/lib.js';
import './style.css';

/* Card Constants */
const CARD_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const CARD_STATES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 43];
const PLAYER_HANDS = (() => {
  let hard = [],
      soft = [],
      splits = [];
  for(let v = 5; v <= 20; v++) {
    hard.push(v);
  }
  for(let v = 12; v <= 20; v++) {
    soft.push(v + 32);
  }
  for(let card of CARD_STATES) {
    splits.push(card + 64);
  }
  return [hard, soft, splits];
})();

// Maps jackfish actions to table actions
const ACTION_MAP = {
  'H': 'H',
  'S': 'S',
  'D': 'Dh',
  'd': 'Ds',
  'P': 'P',
  'RH': 'Rh',
  'RS': 'Rs',
  'RP': 'Rp'
}
const ACTION_CLASSES = {
  'H': 'hit',
  'S': 'stand',
  'Dh': 'doublehit',
  'Ds': 'doublestand',
  'P': 'split',
  'Rh': 'surrenderhit',
  'Rs': 'surrenderstand',
  'Rp': 'surrendersplit'
}

function Box(props) {
  let active = false;
  if(props.selection !== null) {
    active = props.selection[0] === props.player && props.selection[1] === props.dealer;
  }
  let action = ACTION_MAP[(props.cell[2] ? 'R' : '') + props.cell[0]];
  let c = ACTION_CLASSES[action] + (active ? ' active' : '');
  return <div
    className={`box ${c}`}
    id={`${props.player}-${props.dealer}`}
    onClick={props.onSelect}>
    {action}
  </div>;
}

function TableHead() {
  return <div className='row'>
    <div key={CARD_NAMES.length} className='label'></div>
    {CARD_NAMES.map((card, i) => {
      return <div key={i} className='label'>{card}</div>
    })}
  </div>;
}

function Row(props) {
  return <div className='row'>
    <div className='label'>{stateToName(props.player)}</div>
    {CARD_STATES.map((card, i) => {
      return <Box
        key={i}
        onSelect={props.onSelect.bind(null, props.player, card)}
        selection={props.selection}
        player={props.player}
        dealer={card}
        cell={props.jackfish.getTable(props.player, card)}
      />
    })}
  </div>;
}

function Divider(props) {
  return <div className='divider'></div>
}

class Table extends React.Component  {
  constructor(props) {
    super(props)
    this.state = {selection: null}
  }

  onClick(e) {
    e.preventDefault();
    if(e.target.classList[0] !== 'box') {
      this.setState({
        selection: null
      });
      this.props.onClear();
    }
  }

  onSelect(player, dealer) {
    this.props.onSelect(player, dealer);
    this.setState({
      selection: [player, dealer]
    });
  }

  render() {
    return <div className='table' onClick={this.onClick.bind(this)}>
      <TableHead />
      {PLAYER_HANDS.map((group, i) => {
        if(!window.k) window.k = 0; // Iterator for keys
        let rows = group.map((hand, j) => {
          return <Row
            key={window.k++}
            jackfish={this.props.jackfish}
            onSelect={this.onSelect.bind(this)}
            selection={this.state.selection}
            player={hand}
          />
        });
        if(i < PLAYER_HANDS.length - 1) {
          rows.push(<Divider key={window.k++} />);
        }
        return rows;
      })}
    </div>;
  }
}

export default Table;
