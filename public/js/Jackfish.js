/* * MIT License
   *
   * Copyright (c) 2020 Niklas Olson
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE. */

/*-- Constants --*/

// Like an enum, but we can't, because it's JavaScript
const BLACKJACK = -1;
const BUST = -2;
const DEALER_TEN = -3;
const DEALER_ACE = -4;
const ACE = 43;

// A list of all cards
const CARD_STATES = (() => {
  let i = 2;
  let a = fillArray(() => i++, 9);
  a.push(ACE);
  return a;
})();
// A list of possible hands the player or the dealer can have
const HAND_STATES = (() => {
  let a = [];
  for(let i = 2; i < 22; i++) {
    // Hard hands
    a.push(createHand(i, false));
  }
  for(let i = 11; i < 21; i++) {
    // Soft hands
    a.push(createHand(i, true));
  }
  a.push(0, BLACKJACK, BUST, DEALER_TEN, DEALER_ACE);
  return a;
})();
// The player hands recorded by the table
const TABLE_HANDS = (() => {
  let a = [];
  for(let i = 5; i < 22; i++) {
    // Hard hands
    a.push(createHand(i, false));
  }
  for(let i = 12; i < 21; i++) {
    // Soft hands
    a.push(createHand(i, true));
  }
  for(let i = 2; i < 11; i++) {
    // Pairs
    a.push(createHand(i, false, true));
  }
  a.push(createHand(ACE, false, true));
  return a;
})();
// All possible hands the dealer can start with
const DEALER_STATES = HAND_STATES.filter(hand => (hand > 0 && hand < 10) || hand === DEALER_TEN || hand === DEALER_ACE);

// Get src of this js file. We need it to locate the worker file
let scripts = document.getElementsByTagName('script');
let mySrc = scripts[scripts.length - 1].src;

function Jackfish(params_) {
  if(!params_) params_ = {};

  /*-- Private variables --*/

  let matrices = {};
  let params = params_,
      bjOdds, insurance, edge, isLoaded = false,
      table,
      listeners = [];

  /*-- Public functions --*/

  let worker = new Worker(
    mySrc.substr(0, mySrc.lastIndexOf('/')) + '/JackfishWorker.js'
  );
  addMissingParams();
  worker.postMessage(['Constructor', [params]]);
  worker.addEventListener('message', e => {
    if(e.data[0] === 'doAll') {
      isLoaded = true;
      unpackAll.bind(this)(e.data[1]);
    }

    for(let listener of listeners) {
      if(listener.event === e.data[0]) {
        listener.f(e.data[1]);
      }
    }
  });

  this.setParams = (params_, doAll) => {
    params = params_;
    addMissingParams();
    worker.postMessage(['setParams', [params_]]);
    if(doAll) {
      let listener;
      listener = this.addListener('setParams', () => {
        this.removeListener(listener);
        this.doAll();
      });
    }
  }

  this.setCount = (count, doAll) => {
    params.count = count;
    this.setParams(params, doAll);
  }

  this.getBJOdds = dealer => {
    if(dealer === ACE || dealer === 11) dealer = DEALER_ACE;
    if(dealer === 10) dealer = DEALER_TEN;
    return bjOdds[DEALER_STATES.indexOf(dealer)];
  }

  this.doAll = (callback) => {
    isLoaded = false;
    worker.postMessage(['doAll']);
    if(callback !== undefined) {
      let listener = this.addListener('doAll', () => {
        this.removeListener(listener);
        callback();
      });
    }
  }

  // Simulation functions
  this.createSimulation = (options) => {
    worker.postMessage(['createSimulation', [options]]);
  }
  this.updateSimulation = (options) => {
    worker.postMessage(['updateSimulation', [options]]);
  }
  this.runSimulation = (cb) => {
    createSimCallback.bind(this)(cb);
    worker.postMessage(['runSimulation', []]);
  }
  this.clearSimulation = (cb) => {
    createSimCallback.bind(this)(cb);
    worker.postMessage(['clearSimulation', []]);
  }
  this.stopSimulation = (cb) => {
    createSimCallback.bind(this)(cb);
    worker.postMessage(['stopSimulation', []]);
  }

  this.addListener = (event, f) => {
    let listener = { event, f };
    listeners.push(listener);
    return listener;
  }

  this.removeListener = (listener) => {
    for(let i = 0; i < listeners.length; i++) {
      if(listener === listeners[i]) {
        listeners.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  this.getTable = (player, dealer) => {
    if(player && dealer) {
      if(dealer === 'A' || dealer === ACE) dealer = DEALER_ACE;
      if(dealer === 10) dealer = DEALER_TEN;
      return table[TABLE_HANDS.indexOf(player)][DEALER_STATES.indexOf(dealer)];
    } else {
      return table;
    }
  }

  this.getReturn = indexMatrix.bind(null, "rsM", HAND_STATES, DEALER_STATES);
  this.getReturnNoSurrender = indexMatrix.bind(null, "rdM", HAND_STATES, DEALER_STATES);
  this.getReturnNoDouble = indexMatrix.bind(null, "rM", HAND_STATES, DEALER_STATES);
  this.getHit = indexMatrix.bind(null, "hitM", HAND_STATES, DEALER_STATES);
  this.getStand = indexMatrix.bind(null, "standM", HAND_STATES, DEALER_STATES);
  this.getDouble = indexMatrix.bind(null, "doubleM", HAND_STATES, DEALER_STATES);
  this.getSplit = indexMatrix.bind(null, "splitM", DEALER_STATES, DEALER_STATES);
  this.getEnd = indexMatrix.bind(null, "endM", DEALER_STATES, HAND_STATES);

  this.isLoaded = () => isLoaded;
  this.getParams = () => params;
  this.getDoubleRules = () => params.double;
  this.getSplitRules = () => params.split;
  this.getCount = () => params.count;
  this.getBlackjackPay = () => params.blackjack;
  this.getEdge = () => edge;
  this.takeInsurance = () => insurance;

  /*-- Private functions --*/

  function unpackAll(all) {
    bjOdds = all.bjOdds;
    matrices.standM = all.matrices.standM;
    matrices.doubleM = all.matrices.doubleM;
    matrices.endM = all.matrices.endM;
    matrices.rM = all.matrices.rM;
    matrices.rdM = all.matrices.rdM;
    matrices.rsM = all.matrices.rsM;
    matrices.hitM = all.matrices.hitM;
    matrices.splitM = all.matrices.splitM;
    table = all.table;
    insurance = all.insurance;
    edge = all.edge;
    loaded = true;
  }

  function createSimCallback(cb) {
    function callback(data) {
      cb(data);
    }

    function stopCallback(data) {
      cb(data);
      this.removeListener(l1);
      this.removeListener(l2);
      this.removeListener(l3);
      this.removeListener(l4);
    }

    let l1 = this.addListener('runSimulation', callback.bind(this));
    let l2 = this.addListener('clearSimulation', callback.bind(this));
    let l3 = this.addListener('stopSimulation', stopCallback.bind(this));
    let l4 = this.addListener('updateSimulation', callback.bind(this));
  }

  function indexMatrix(name, rowIndexer, colIndexer, i, j) {
    if(rowIndexer === DEALER_STATES) {
      if(i === 10) {
        i = -3;
      } else if(i === ACE || i === 'A') {
        i = -4;
      }
    } else if(colIndexer === DEALER_STATES) {
      if(j === 10) {
        j = -3;
      } else if(j === ACE) {
        j = -4;
      }
    }

    if(matrices[name] === undefined) {
      throw `No matrix with name ${name}`;
    }
    if(i && j) {
      if(matrices[name][rowIndexer.indexOf(i)] === undefined) {
        throw `Matrix ${name} has no row ${i}`;
      } else if(matrices[name][rowIndexer.indexOf(i)][colIndexer.indexOf(j)] === undefined) {
        throw `Matrix ${name} has no column ${j}`;
      }
      return matrices[name][rowIndexer.indexOf(i)][colIndexer.indexOf(j)];
    } else {
      return matrices[name];
    }
  }

  function addMissingParams() {
    if(!params.blackjack) params.blackjack = 1.5;
    if(!params.count) params.count = { system: 'none' };
    if(params.peek === undefined) params.peek = true;
    if(params.soft17 === undefined) params.soft17 = true;
    if(!params.surrender) params.surrender = 'none';

    if(!params.count.system) params.count.system = 'none';
    if(!params.count.decks) params.count.decks = 6;
    if(params.count.system !== 'none' && !params.count.tc && !params.count.count) {
      params.count.tc = 0;
      params.count.count = 0;
    } else if(params.count.system !== 'none' && !params.count.tc) {
      params.count.count = 0;
    } else if(params.count.system !== 'none' && !params.count.count) {
      params.count.tc = 0;
    }

    if(!params.double) {
      params.double = {anytime: false, min: 0};
    }
    if(params.double.anytime === undefined) {
      params.double.anytime = false;
    }
    if(params.double.min === undefined) {
      params.double.min = 0;
    }

    if(!params.split) {
      params.split = {
        double: true,
        maxHands: Infinity,
        oneCardAfterAce: true,
        resplit: true,
        resplitAces: true
      };
    }
    if(params.split.double === undefined) {
      params.split.double = true;
    }
    if(!params.split.maxHands) {
      params.split.maxHands = Infinity;
    }
    if(params.split.oneCardAfterAce === undefined) {
      params.split.oneCardAfterAce = true;
    }
    if(params.split.resplit === undefined) {
      params.resplit = true;
    }
    if(params.split.resplitAces === undefined) {
      params.resplitAces = true;
    }
  }

  this.setParams(params, true);
}

/*-- Utility functions --*/

function createHand(value, soft, pair) {
  if(pair) value += 0x40;
  if(soft) value += 0x20;
  return value;
}

function fillArray(value, len) {
  let a = [];
  if(typeof value === 'function') {
    for(let i = 0; i < len; i++) {
      a.push(value());
    }
  } else {
    for(let i = 0; i < len; i++) {
      a.push(value);
    }
  }
  return a;
}
