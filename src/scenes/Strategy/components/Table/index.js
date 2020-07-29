import React from 'react';
import stateToName from '../../../../lib/lib.js';
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
        cell={props.row[(i+1)%10]}
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

  onSelect(player, dealer) {
    this.props.onSelect(player, dealer);
    this.setState({
      selection: [player, dealer]
    });
  }

  render() {
    return <div className='table'>
      <TableHead />
      {PLAYER_HANDS.map((group, i) => {
        if(!window.k) window.k = 0; // Iterator for keys
        let rows = group.map((hand, j) => {
          let row;
          if(hand >= 64) {
            row = this.props.table[(CARD_STATES.indexOf(hand - 64) + 1) % 10 + 33];
          } else {
            row = this.props.table[this.props.handStates.indexOf(hand)];
          }
          return <Row
            key={window.k++}
            onSelect={this.onSelect.bind(this)}
            selection={this.state.selection}
            player={hand} row={row}
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
