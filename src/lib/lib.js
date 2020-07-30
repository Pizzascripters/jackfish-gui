import React from 'react';

function stateToName(state, long) {
  let v = String(state & 0x1f);
  let soft = state & 0x20;
  let pair = state & 0x40;
  if(long) {
    if(soft && v === '11') {
      v = 'Ace';
    } else if(soft) {
      v = 'Soft ' + v;
    } else if(!pair && Number(v) > 11) {
      v = 'Hard ' + v;
    }
    if(pair) {
      return `Pair of ${v}s`
    } else {
      return v;
    }
  } else {
    if(soft && v === '11') {
      v = 'A';
    } else if(soft) {
      v += '\'';
    }
    if(pair && v === '10') {
      return 'T,T';
    } else if(pair) {
      return v + ',' + v;
    } else {
      return v;
    }
  }
}

function formatPercent(a, b) {
  if(b && a > .5) {
    return <span className='deepgreen'>+{formatPercent(a)}</span>;
  } else if(b && a > .1) {
    return <span className='green'>+{formatPercent(a)}</span>;
  } else if(b && a > 0) {
    return <span className='lightgreen'>+{formatPercent(a)}</span>;
  } else if(b && a < -.5) {
    return <span className='deepred'>{formatPercent(a)}</span>;
  } else if(b && a < -.1) {
    return <span className='red'>{formatPercent(a)}</span>;
  } else if(b && a < 0) {
    return <span className='lightred'>{formatPercent(a)}</span>;
  } else {
    return (100*a).toPrecision(3) + '%';
  }
}

export { stateToName };
export { formatPercent };
