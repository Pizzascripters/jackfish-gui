function Jackfish(params) {
  /*-- Hand and card constants --*/

  // Like an enum, but we can't, because it's JavaScript
  const BLACKJACK = -1;
  const BUST = -2;
  const DEALER_TEN = -3;
  const DEALER_ACE = -4;
  const ACE = 43;

  // A list of possible hands the player or the dealer can have
  const HAND_STATES = (() => {
    let a = [];
    loop(2, 22, v => a.push(createHand(v, false))); // Hard hands
    loop(11, 21, v => a.push(createHand(v, true))); // Soft hands
    a.push(0, BLACKJACK, BUST, DEALER_TEN, DEALER_ACE);
    return a;
  })();
  // The player hands recorded by the table
  const TABLE_HANDS = (() => {
    let a = [];
    loop(5, 22, v => a.push(createHand(v, false))); // Hard hands
    loop(12, 21, v => a.push(createHand(v, true))); // Soft hands
    loop(2, 11, v => a.push(createHand(v, false, true))); // Pairs
    a.push(createHand(ACE, false, true));
    return a;
  })();
  // All possible hands the dealer can start with
  const DEALER_STATES = HAND_STATES.filter(hand => (hand > 0 && hand < 10) || hand === DEALER_TEN || hand === DEALER_ACE);

  /*-- Public Functions --*/

  // Positive number indicates player has an edge
  this.isLoaded = () => loaded;
  this.getCount = () => params.count;
  this.getComp = () => comp;
  this.getParams = () => params;
  this.getReturn = () => rsM;
  this.getReturnNoDouble = () => rM;
  this.getTable = getTable;
  this.getEnd = (dealer, end) => {
    return iDSMatrix(endM, dealer, end);
  }
  this.getHit = (player, dealer) => {
    return iSDMatrix(hitM, player, dealer);
  }
  this.getStand = (player, dealer) => {
    return iSDMatrix(standM, player, dealer);
  }
  this.getDouble = (player, dealer) => {
    return iSDMatrix(doubleM, player, dealer);
  }
  this.getSplit = (player, dealer) => {
    return iDDMatrix(splitM, player, dealer);
  }
  this.getEdge = () => edge;
  this.setParams = (params_) => {
    loaded = false;
    worker.postMessage(['setParams', [params_]]);
    params = params_;
  }
  this.takeInsurance = () => insurance;
  this.createSimulation = (options) => {
    worker.postMessage(['createSimulation', [options]]);
  }
  this.updateSimulation = (options) => {
    worker.postMessage(['updateSimulation', [options]]);
  }
  this.addListener = (f) => {
    listeners.push(f);
  }
  defineConstants.bind(this)([
    ['BLACKJACK', BLACKJACK],
    ['BUST', BUST],
    ['DEALER_TEN', DEALER_TEN],
    ['DEALER_ACE', DEALER_ACE],
    ['ACE', ACE],
  ], true);

  /*-- Private Variables --*/
  let comp;
  let endM, standM, doubleM;
  let table;
  let edge, insurance;
  let loaded = false;
  let listeners = [];

  // Return matrices. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return without doubling
  // let rdM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with doubling
  let rsM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with surrendering
  let hitM = zeroes([HAND_STATES.length, DEALER_STATES.length]);
  let splitM = zeroes([DEALER_STATES.length, DEALER_STATES.length]);

  /*-- Worker --*/
  // for computationally heavy tasks
  let worker = new Worker('js/Jackfish.js');
  worker.postMessage(['Constructor', [params]]);
  worker.addEventListener('message', e => {
    if(e.data[0] === 'setParams') {
      worker.postMessage(['doAll']);
    } else if(e.data[0] === 'doAll') {
      // Unpack data
      let all = e.data[1];
      standM = all.matrices.standM;
      doubleM = all.matrices.doubleM;
      endM = all.matrices.endM;
      rM = all.matrices.rM;
      // rdM = all.matrices.rdM;
      rsM = all.matrices.rsM;
      hitM = all.matrices.hitM;
      splitM = all.matrices.splitM;
      table = all.table;
      insurance = all.insurance;
      edge = all.edge;
      loaded = true;
      for(let listener of listeners) {
        listener();
      }
    }
  });

  /*-- Table generation --*/
  function getTable(player, dealer) {
    if(player && dealer) {
      if(dealer === 'A' || dealer === ACE) dealer = DEALER_ACE;
      if(dealer === 10) dealer = DEALER_TEN;
      return table[TABLE_HANDS.indexOf(player)][DEALER_STATES.indexOf(dealer)];
    } else {
      return table;
    }
  }

  function defineConstants(constants, list) {
    if(list) {
      for(let constant of constants) {
        defineConstants.bind(this)(constant);
      }
    } else {
      let c = constants;
      Object.defineProperty(this, c[0], {
        value: c[1],
        configurable: true,
        enumerable: true,
        writable: false,
      })
    }
  }

  /*-- High Level Functions --*/

  function createHand(value, soft, pair) {
    if(pair) value += 0x40;
    if(soft) value += 0x20;
    return value;
  }

  /*-- General Utility Functions --*/

  // Index state,state matrix: m[state][state]
  // function iSSMatrix(m, i, j) {
  //   return m[HAND_STATES.indexOf(i)][HAND_STATES.indexOf(j)];
  // }

  // Index state,dealer matrix: m[state][dealer]
  function iSDMatrix(m, i, j) {
    if(j === 10) j = DEALER_TEN;
    if(j === ACE) j = DEALER_ACE;
    return m[HAND_STATES.indexOf(i)][DEALER_STATES.indexOf(j)];
  }

  // Index dealer,state matrix: m[dealer][state]
  function iDSMatrix(m, i, j) {
    if(i === 10) i = DEALER_TEN;
    if(i === ACE) i = DEALER_ACE;
    return m[DEALER_STATES.indexOf(i)][HAND_STATES.indexOf(j)];
  }

  // Index dealer,dealer matrix: m[dealer][dealer]
  function iDDMatrix(m, i, j) {
    return iDealer(iDealer(m, i), j);
  }

  // Index state array: v[state]
  // function iState(v, i) {
  //   return v[findHand(i)];
  // }

  // Index dealer array: v[dealer]
  function iDealer(v, i) {
    if(i === 10) i = DEALER_TEN;
    if(i === ACE) i = DEALER_ACE;
    return v[findHand(i, true)];
  }

  function findHand(i, dealer) {
    if(dealer) {
      return DEALER_STATES.indexOf(i);
    } else {
      return HAND_STATES.indexOf(i);
    }
  }

  /*-- Logic Utility Functions --*/

  function loop(start, end, f) {
    for(let i = start; i < end; i++) {
      f(i);
    }
  }

  function fillArray(value, len) {
    let a = [];
    if(typeof value === 'function') {
      loop(0, len, () => a.push(value()));
    } else {
      loop(0, len, () => a.push(value));
    }
    return a;
  }

  function zeroes(dims) {
    if(dims.length === 1) {
      return fillArray(0, dims[0]);
    } else {
      return fillArray(zeroes.bind(null, dims.slice(1)), dims[0]);
    }
  }
}

export default Jackfish;
