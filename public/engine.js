/* Odds constants */
// [spanish, standard]
const CARD_ODDS = [1/12, 1/13]; // The odds that we draw any given card
const TEN_ODDS = [3/12, 4/13];
const ACE_HIGH_RATIO = [1/4, 1/5]; // Aces : high cards
const TEN_HIGH_RATIO = [3/4, 1/4]; // Ten : high cards

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
// All possible hands the dealer can start with
const DEALER_STATES = HAND_STATES.filter(hand => hand > 0 && hand < 11 || hand === 43);

function Engine(params) {
  let odds = drawOdds(params.spanish, params.count);

  // Return matrix. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]);

  // Calculate dealer's odds to reach each endstate
  // Raising to 12th power because that's the maximum number of times the dealer can hit
  let endM = mpower(dealerMatrix(odds, params.soft17), 12);

  // Calculate player's return by standing
  let standM = standReturns(endM);
  // Set return on 21 to be return on stand because player must stand on 21
  loop(0, DEALER_STATES.length, i => {
    let j = HAND_STATES.indexOf(21);
    rM[j][i] = standM[j][i];
  });

  // Calculate player's return by doubling
  let doubleM = doubleReturns(endM, standM, odds);

  this.bestMove = (player, dealer) => {
    let i = HAND_STATES.indexOf(player);
    let j = DEALER_STATES.indexOf(dealer);
    let stand = standM[i][j];
    let double = doubleM[i][j];

    // TODO: Calculate player's return on bet by hitting

    // TODO: Calculate player's return on bet by surrendering

    // TODO: Calculate player's return on bet by splitting

    // TODO: Compare returns and return best
    return ['S', stand];
  }

  this.getStand = () => standM;
  this.getDouble = () => doubleM;
  this.getOdds = () => odds;
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
      odds.push(cardOdds - count.getTc() / 104);
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

// // Create transition matrix for hand states
// function transitionMatrix(spanish, count, params) {
//   let odds = drawOdds(spanish, count);
//   let a = zeroes([HAND_STATES.length, HAND_STATES.length]);
//
//   function addTransition(i, value, weight) {
//     let j = HAND_STATES.indexOf(value);
//     a[i][j] += weight;
//   }
//
//   for(let i in HAND_STATES) {
//     let hand = HAND_STATES[i];
//     let [value, soft] = getHandDetails(hand);
//
//     if(params.endCondition && params.endCondition(value, soft, hand)) {
//       // End state
//       a[i][i] = 1;
//       continue;
//     }
//
//     let weight = 1;
//     if(params.weights) {
//       weight.forEach(w => {
//         if(w.condition(value, soft, hand)) {
//           weight = w.getWeight(odds);
//         }
//       });
//     }
//
//     odds.forEach((probability, j) => {
//       let v = j + 1;
//       if(params.skip && params.skip(soft, value, hand, v)) return;
//       if(value + v === 21) {
//         // 21
//         addTransition(i, 21, probability);
//       } else if(j === 0 && value < 11) {
//         // <11 to soft hand
//         addTransition(i, value + 43, probability);
//       } else if(soft && value + v > 21) {
//         // Ace goes from 10 -> 1
//         addTransition(i, value + v - 10, probability);
//       } else if(value + v > 21) {
//         // Bust
//         addTransition(i, -2, probability);
//       } else {
//         // hard -> hard or soft -> soft
//         addTransition(i, value + v + soft, weight * probability);
//       }
//     });
//   }
//
//   return a;
// }

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
        r += odds * ((value > v) - (value < v));
      });

      a[i].push(r);
    });
  });
  return a;
}

function doubleReturns(end, stand, odds) {
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
