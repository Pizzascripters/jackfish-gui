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

// Create transition matrix for the dealer
function dealerMatrix(soft17, spanish, count) {
  // soft17 is true if dealer hits

  let odds = drawOdds(spanish, count);
  let a = zeroes([HAND_STATES.length, HAND_STATES.length]);

  function addTransition(i, value, weight) {
    let j = HAND_STATES.indexOf(value);
    a[i][j] += weight;
  }

  for(let i in HAND_STATES) {
    let hand = HAND_STATES[i];
    let value = -1,
        soft = false;
    if(hand >= 0) {
      value = hand & 31;
      soft = hand & 32;
    } else if(hand === -3) {
      value = 10;
    }

    if(value < 0 || value > 17 || value === 17 && (!soft || !soft17)) {
      // End state
      a[i][i] = 1;
      continue;
    }

    // When we have information about the dealer's second card, we have to weight the odds
    let weight = 1;
    if(hand === -3) {
      weight = 1 / (1 - odds[0]); // One ten. Dealer can't have an ace.
    } else if(soft && value === 11) {
      weight = 1 / (1 - odds[9]); // One ace. Dealer can't have a 10.
    }

    odds.forEach((probability, j) => {
      let v = j + 1;
      if((hand === -3 || soft && value === 11) && value + v === 21) return; // Skip blackjack
      if(j === 0 && value === 10) {
        // 10 + Ace (more than 2 cards) eg. 3,7,A
        addTransition(i, 21, probability);
      } else if(j === 0 && value < 11) {
        // <11 to soft hand
        addTransition(i, value + 43, probability);
      } else if(value + v === 21) {
        // 21, but not blackjack
        addTransition(i, 21, probability);
      } else if(soft && value + v > 21) {
        // Ace goes from 10 -> 1
        addTransition(i, value + v - 10, probability);
      } else if(value + v > 21) {
        // Bust
        addTransition(i, -2, probability);
      } else {
        // hard -> hard or soft -> soft
        addTransition(i, value + v + soft, weight * probability);
      }
    });
  }

  return a;
}

function dealerHand(value, soft) {
  return soft*32 + value;
}
