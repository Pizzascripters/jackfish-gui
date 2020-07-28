import React from 'react';
import './Table.css';

/* Card Constants */
const CARD_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const PLAYER_HANDS = (() => {
  let hard = [],
      soft = [],
      splits = [];
  for(let v = 5; v <= 20; v++) {
    hard.push(String(v));
  }
  for(let v = 12; v <= 20; v++) {
    soft.push(String(v)+'\'');
  }
  for(let card of CARD_NAMES) {
    splits.push(`${card},${card}`);
  }
  return [hard, soft, splits];
})();

function Box(props) {
  return <div className='unknown' id={`${props.player}-${props.dealer}`}></div>
}

function TableHead() {
  return <div className='row'>
    <div className='label'></div>
    {CARD_NAMES.map((card, i) => {
      return <div className='label'>{card}</div>
    })}
  </div>;
}

function Row(props) {
  return <div className='row'>
    <div className='label'>{props.player === '10,10' ? 'T,T' : props.player}</div>
    {CARD_NAMES.map((card, i) => {
      return <Box key={i} player={props.player} dealer={card}/>
    })}
  </div>;
}

function Divider(props) {
  return <div className='divider'></div>
}

function Table() {
  return <div className='table'>
    <TableHead />
    {PLAYER_HANDS.map((group, i) => {
      if(!window.k) window.k = 0; // Iterator for keys
      let rows = group.map((hand, j) => {
        return <Row key={window.k++} player={hand} />
      });
      rows.push(<Divider key={window.k++} />);
      return rows;
    })}
  </div>;
}

export default Table;
