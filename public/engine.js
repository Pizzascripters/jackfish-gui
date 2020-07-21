/* Odds constants */
// [spanish, standard]
const CARD_ODDS = [1/12, 1/13]; // The odds that we draw any given card
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
const HAND_ORDER = [-2, -1, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 0, 107, 66, 67, 68, 69, 70, 71, 72, 73, 74];
// All possible hands the dealer can start with
const DEALER_STATES = HAND_STATES.filter(hand => hand > 0 && hand < 10 || hand === 43 || hand === -3);

function Engine(params) {
  let odds = drawOdds(params.spanish, params.count);

  // Return matrix. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]);
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
  });

  // Calculate player's return by doubling
  let doubleM = doubleReturns(standM, odds);

  /* Table generation processes */

  let table = [];
  let state = 0;
  let orderI = 3; // Iterator for the state
  let dealer = 0;
  let working = false;
  let finished = false;

  // Start or continue table generation
  this.start = () => {
    working = true;
    work();
  }

  // Pause creation of the table
  this.pause = () => {
    working = false;
  }

  function work() {
    if(finished) return;

    if(orderI < 34) {
      // Hard and soft non-pair hands
      state = HAND_STATES.indexOf(HAND_ORDER[orderI]);
      if(!table[state]) {
        table[state] = [];
      }
      table[state][dealer] = bestMove(state, dealer);
      rdM[state][dealer] = table[state][dealer][1];
      rM[state][dealer] = Math.max(standM[state][dealer], hitM[state][dealer]);
    } else {
      // Pairs / splitting
      state = orderI - 3;
      if(!table[state]) {
        table[state] = [];
      }
      let pre = HAND_STATES.indexOf((HAND_ORDER[orderI] & 63) * 2); // Before split
      if(HAND_ORDER[orderI] & 32) {
        pre = HAND_STATES.indexOf(12 + 32) // Two aces
      }
      let post = HAND_STATES.indexOf(HAND_ORDER[orderI] & 63); // After split
      let r = rdM[pre][dealer];
      let rs = splitReturns(post, transpose(rdM)[dealer], odds);
      if(r > rs) {
        table[state][dealer] = table[pre][dealer];
      } else {
        table[state][dealer] = ['P', rs]
      }
    }

    // Advance to next cell
    if(++dealer === CARD_STATES.length) {
      if(++orderI === HAND_ORDER.length) {
        finished = true;
      } else {
        dealer = 0;
      }
    }

    // Call again
    new Promise(() => {
      if(working) {
        work();
      }
    });
  }

  function bestMove(i, j) {
    let stand = standM[i][j];
    let double = doubleM[i][j];

    // TODO: Calculate player's return on bet by hitting
    let hit = hitReturns(i, transpose(rM)[j], odds);
    hitM[i][j] = hit;

    // TODO: Calculate player's return on bet by surrendering

    // TODO: Calculate player's return on bet by splitting

    // Compare returns and return best
    if(hit > stand && hit > double) {
      return ['H', hit];
    } else if(stand > double) {
      return ['S', stand];
    } else if(hit > stand) {
      return ['D', double];
    } else {
      return ['d', double];
    }
  }
  this.bestMove = (player, dealer) => {
    let i = HAND_STATES.indexOf(player);
    let j = DEALER_STATES.indexOf(dealer);
    return bestMove(i, j);
  };

  this.getDouble = () => doubleM;
  this.getHit = () => hitM;
  this.getReturnNoDouble = () => rM;
  this.getReturn = () => rdM;
  this.getStand = () => standM;
  this.getCount = () => params.count;
  this.getOdds = () => odds;
  this.getTable = () => table;
}

// Constructor for the count
function Count(system, count, decks) {
  this.system = system;
  this.count = count;
  this.decks = decks;

  // True count
  this.getTc = () => this.count / this.decks;
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
    HAND_STATES.forEach((hand, j) => {
      let sum = 0;
      CARD_STATES.forEach((card, k) => {
        sum += odds[k] * (P[i][k] === hand);
      });
      a[i][j] = sum;
    });
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
        v = getHandDetails(dHand)[0]; // Dealer value
        if(hand === -2) {
          // If player busts, they just lose
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
    hitState = H[i];
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
