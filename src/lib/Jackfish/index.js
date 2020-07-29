/* Odds constants */
// [spanish, standard]
const CARD_ODDS = [1/12, 1/13]; // The odds that we draw a non-ten given card
const TEN_ODDS = [3/12, 4/13];
const ACE_HIGH_RATIO = [1/4, 1/5]; // Aces : high cards
const TEN_HIGH_RATIO = [3/4, 4/5]; // Ten : high cards

// A list of all cards (ace is 1)
const CARD_STATES = (() => {
  let i = 0;
  return fillArray(() => ++i, 10);
})();
// A list of possible hands the player or the dealer can have
const HAND_STATES = (() => {
  let a = [];
  loop(11, 21, v => a.push(dealerHand(v, true))); // Soft hands
  loop(2, 22, v => a.push(dealerHand(v, false))); // Hard hands
  a.push(0, -1, -2, -3); // No cards, blackjack, bust, and one 10, respectively

  return a;
})();
// The order we should determine the best moves
const HAND_ORDER = [-2, -1, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 0, 108, 68, 70, 72, 74, 76, 78, 80, 82, 84];
// All possible hands the dealer can start with
const DEALER_STATES = HAND_STATES.filter(hand => hand > 0 && hand < 10 || hand === 43 || hand === -3);

function Jackfish(params) {
  let odds = drawOdds(params.spanish, params.count);

  // Return matrix. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return without doubling
  let rdM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with doubling
  let hitM = zeroes([HAND_STATES.length, DEALER_STATES.length]);

  // Calculate dealer's odds to reach each endstate
  // Raising to 12th power because that's the maximum number of times the dealer can hit
  let endM = mpower(dealerMatrix(odds, params.soft17), 12);

  // Calculate player's return by standing
  let standM = standReturns(endM);
  // Set return on 21 to be return on stand because player must stand on 21
  loop(0, DEALER_STATES.length, i => {
    let j = HAND_STATES.indexOf(21);
    rdM[j][i] = rM[j][i] = standM[j][i];
    j = HAND_STATES.indexOf(-2);
    rdM[j][i] = rM[j][i] = -1;
    j = HAND_STATES.indexOf(-1);
    rdM[j][i] = rM[j][i] = 1.5;
  });

  // Calculate player's return by doubling
  let doubleM = doubleReturns(standM, odds);

  this.getTable = () => {
    let table = []; // table[i][j]
    let j = 0; // Dealer card
    let k = 3; // Index HAND_ORDER
    let finished = false;

    while(!finished) {
      // Calculate returns and best move
      let state = HAND_ORDER[k];
      let i,i_;
      if(state & 64) {
        // Pair
        // We subtract 1 because state=-3 isn't included in HAND_ORDER
        i = HAND_STATES.length - 1 + k - HAND_ORDER.indexOf(108);
        i_ = HAND_STATES.indexOf(state & 63);
      } else {
        i_ = i = HAND_STATES.indexOf(state);
      }
      if(!table[i]) {
        table[i] = [];
      }
      table[i][j] = bestMove(i_, j, state & 64);
      if(!(state & 64)) {
        // Only store return for non-pairs
        rdM[i][j] = table[i][j][1];
        rM[i][j] = Math.max(standM[i][j], hitM[i][j]);
      }

      // Advance to next cell
      if(++j === CARD_STATES.length) {
        if(++k === HAND_ORDER.length) {
          finished = true;
        } else {
          j = 0;
        }
      }
    }

    return table;
  }

  function bestMove(i, j, pair) {
    let state = HAND_STATES[i];
    let dealer = CARD_STATES[j];
    let stand = standM[i][j];
    let double = doubleM[i][j];

    // Calculate return by hitting
    let hit = hitReturns(i, transpose(rM)[j], odds);
    hitM[i][j] = hit;

    // Calculate return by splitting
    let split = -Infinity;
    if(pair) {
      let post = state === 44 ? 43 : state / 2; // State after splitting
      let r = params.doubleAfterSplit ? rdM : rM;
      split = splitReturns(HAND_STATES.indexOf(post), transpose(r)[j], odds);
    }

    // Decide whether to surrender if possible
    let ret = Math.max(split, hit, stand, double); // Return of best move
    let sur = (params.surrender === 'late' || params.surrender === 'early' && dealer !== 1 && dealer !== 10) &&
              ret < -.5;
    if(params.surrender === 'early' && dealer === 1) {
      let bjOdds = odds[CARD_STATES.indexOf(10)];
      sur = ret * (1 - bjOdds) - bjOdds < -.5;
    } else if(params.surrender === 'early' && dealer === 10) {
      let bjOdds = odds[CARD_STATES.indexOf(1)];
      sur = ret * (1 - bjOdds) - bjOdds < -.5;
    }

    // Compare returns and return best
    if(split > hit && split > stand && split > double) {
      return ['P', split, sur];
    } else if(hit > stand && hit > double) {
      return ['H', hit, sur];
    } else if(stand > double) {
      return ['S', stand, sur];
    } else if(hit > stand) {
      return ['D', double, sur];
    } else {
      return ['d', double, sur];
    }
  }
  this.bestMove = (player, dealer, split) => {
    let i = HAND_STATES.indexOf(player);
    let j = DEALER_STATES.indexOf(dealer);
    return bestMove(i, j, split);
  };

  // Positive number indicates player has an edge
  this.getEdge = (j) => {
    if(j === undefined) {
      let edge = 0;
      loop(0, CARD_STATES.length, i => {
        edge += odds[i] * this.getEdge(i);
      });
      return 100 * edge;
    } else {
      let state = mpower(hitMatrix(odds), 2)[HAND_STATES.indexOf(0)];
      state[HAND_STATES.indexOf(-1)] = state[HAND_STATES.indexOf(21)]; // 21 after 2 cards is blackjack
      state[HAND_STATES.indexOf(21)] = 0;
      let bjOdds = 0;
      if(CARD_STATES[j] === 1) {
        bjOdds = odds[CARD_STATES.indexOf(10)];
      } else if(CARD_STATES[j] === 10) {
        bjOdds = odds[CARD_STATES.indexOf(1)];
      }
      let r = dot(state, transpose(rdM)[j]);
      return r * (1 - bjOdds) - bjOdds;
    }
  }

  this.getHandStates = () => HAND_STATES;
  this.getDouble = () => doubleM;
  this.getHit = () => hitM;
  this.getReturnNoDouble = () => rM;
  this.getReturn = () => rdM;
  this.getStand = () => standM;
  this.getCount = () => params.count;
  this.getOdds = () => odds;
}

// Odds that we draw each card
function drawOdds(spanish, count) {
  spanish = Number(!spanish); // For array indexing
  // The odds for a deck with no cards pulled
  let baseOdds = (() => {
    let a = fillArray(CARD_ODDS[spanish], 9);
    a.push(TEN_ODDS[spanish]);
    return a;
  })();
  switch(count.system) {
    case 'none':
      return baseOdds;
    case 'hilo':
      return hiloOdds(spanish, count);
  }
  if(count.system === 'none') {
    return baseOdds;
  } else if(count.system === 'hilo') {
    return hiloOdds(spanish, count);
  }
}

function hiloOdds(spanish, count) {
  // Aliases
  let cardOdds = CARD_ODDS[spanish];
  let aceHighRatio = ACE_HIGH_RATIO[spanish];
  let tenOdds = TEN_ODDS[spanish];
  let tenHighRatio = TEN_HIGH_RATIO[spanish];

  let odds = [];
  loop(0, 10, i => {
    if(i === 0) {
      // Ace
      odds.push(cardOdds + aceHighRatio * count.getTc() / 104);
    } else if(i === 9) {
      // 10
      odds.push(tenOdds + tenHighRatio * count.getTc() / 104);
    } else if(i <= 5) {
      // 2-6
      odds.push(cardOdds - count.getTc() / 520);
    } else {
      // 7-9
      odds.push(cardOdds);
    }
  });
  return odds;
}

// P[state][card] = new state
function progressionMatrix() {
  let a = [];

  HAND_STATES.forEach((hand, i) => {
    a[i] = [];
    let [value, soft] = getHandDetails(hand);
    CARD_STATES.forEach((card, j) => {
      if(hand === -3 && card === 1 || hand === 43 && card === 10) {
        // Blackjack
        a[i][j] = -1;
      } else if(value + card === 21 || card === 1 && value === 10) {
        // 21, but not blackjack
        a[i][j] = 21;
      } else if(j === 0 && value < 11) {
        // <11 to soft hand
        a[i][j] = value + 43;
      } else if(soft && value + card > 21) {
        // Ace goes from 10 -> 1
        a[i][j] = value + card - 10;
      } else if(value + card > 21) {
        // Bust
        a[i][j] = -2;
      } else {
        // hard -> hard or soft -> soft
        a[i][j] = value + card + soft;
      }
    });
  });

  return a;
}

// Create transition matrix for the player on hit
function hitMatrix(odds) {
  let P = progressionMatrix();

  let a = [];
  HAND_STATES.forEach((hand, i) => {
    a[i] = [];
    HAND_STATES.forEach((hand, j) =>
      a[i][j] = CARD_STATES.reduce((sum, card, k) =>
        sum + odds[k] * (P[i][k] === hand), 0
      )
    );
  });

  return a;
}

function dealerMatrix(odds, soft17) {
  let a = hitMatrix(odds);

  HAND_STATES.forEach((hand, i) => {
    let [value, soft] = getHandDetails(hand);

    // Dealer stands
    if(value < 0 || value > 17 || value === 17 && (!soft || !soft17)) {
      a[i] = zeroes([HAND_STATES.length]);
      return a[i][i] = 1;
    }

    // When we have information about the dealer's second card, we have to weight the odds
    let weight;
    if(hand === -3) {
      weight = 1 / (1 - odds[0]); // One ten. Dealer can't have an ace.
    } else if(soft && value === 11) {
      weight = 1 / (1 - odds[9]); // One ace. Dealer can't have a 10.
    }

    // Apply the weight
    if(weight) {
      a[i][HAND_STATES.indexOf(-1)] = 0; // Blackjack is impossible
      a[i] = a[i].map(probability => weight * probability);
    }
  });

  return a;
}

// Calculate player's return by standing
function standReturns(endMatrix) {
  let a = [];
  // Looks like O(N^3), but is really O(1) because the arrays we're iterating over have constant size
  HAND_STATES.forEach((hand, i) => {
    a.push([]);
    let value = getHandDetails(hand)[0]; // Player value
    DEALER_STATES.forEach((dealer, j) => {
      let idx = HAND_STATES.indexOf(dealer);
      let endOdds = endMatrix[idx];
      let r = 0; // Return on bet

      endOdds.forEach((odds, k) => {
        let dHand = HAND_STATES[k];
        let v = getHandDetails(dHand)[0]; // Dealer value
        if(hand === -2) {
          r -= 1;
        } else {
          r += odds * ((value > v) - (value < v));
        }
      });

      a[i].push(r);
    });
  });
  return a;
}

// Calculate player's return by hitting
function hitReturns(i, r, odds) {
  return dot(hitMatrix(odds)[i], r);
}

// Calculate player's return by splitting
function splitReturns(i, r, odds) {
  return 2 * dot(hitMatrix(odds)[i], r);
}

function doubleReturns(stand, odds) {
  let a = [];
  let H = hitMatrix(odds);
  HAND_STATES.forEach((hand, i) => {
    let hitState = H[i];
    a[i] = mmultiply(hitState, transpose(stand)).map(x => 2*x);
  });
  return a;
}

function dealerHand(value, soft) {
  return soft*32 + value;
}

function getHandDetails(hand) {
  let value = -1,
      soft = false;
  if(hand >= 0) {
    value = hand & 31;
    soft = hand & 32;
  } else if(hand === -3) {
    value = 10;
  }
  return [value, soft];
}

/* Logic functions */

function loop(start, end, f) {
  for(let i = start; i < end; i++) {
    f(i);
  }
}

// Like loop but in reverse
function rLoop(start, end, f) {
  for(let i = start; i > end; i--) {
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

/* Mathy functions */

function dot(u, v) {
  return u.reduce((r, x, i) => r + x * v[i], 0);
}

function transpose(a) {
  let b = [];
  loop(0, a[0].length, j => {
    b.push([]);
    loop(0, a.length, i => b[j].push(a[i][j]));
  });
  return b;
}

// mmultiply(vec, matrix) or mmultiply(matrix, matrix)
function mmultiply(v, a) {
  if(v[0] && v[0].length !== undefined) {
    let c = [];
    a = transpose(a);
    // v times a
    v.forEach((row, i) => {
      c.push([]);
      a.forEach((col, j) => c[i].push(dot(row, col)));
    });
    return c;
  } else {
    let w = [];
    for(let u of a) {
      w.push(dot(v, u));
    }
    return w;
  }
}

// Raise a matrix to a positive integer power (n>0)
function mpower(a, n) {
  let p = a;
  loop(1, n, () => p = mmultiply(p, a));
  return p;
}

export default Jackfish;
