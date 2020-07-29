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

export default stateToName;
