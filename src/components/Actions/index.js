import React from 'react';
import {formatPercent, formatMove} from '../../lib/lib.js';
import './style.css';

function Actions(props) {
  if(props.selection) {
    let jackfish = window.jackfish;
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
    let labels = [formatMove('H'), formatMove('S'), formatMove('DD'), formatMove('P'), formatMove('R')];
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

export default Actions;
