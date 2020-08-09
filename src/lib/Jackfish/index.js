function Jackfish(params) {
  /*-- Odds constants --*/

  const CARD_ODDS = 1/13; // The odds that we draw a non-ten given card
  const TEN_ODDS = 4/13;
  const ACE_HIGH_RATIO = 1/5; // Aces : high cards

  /*-- Hand and card constants --*/

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
    loop(2, 22, v => a.push(createHand(v, false))); // Hard hands
    loop(11, 21, v => a.push(createHand(v, true))); // Soft hands
    a.push(0, BLACKJACK, BUST, DEALER_TEN, DEALER_ACE);
    return a;
  })();
  // The order we should determine the best moves
  const HAND_ORDER = (() => {
    let a = [];
    a.push(BUST, BLACKJACK);
    rLoop(21, 11, v => a.push(createHand(v))); // Hard hands 12+
    rLoop(20, 10, v => a.push(createHand(v, true))); // Soft hands
    rLoop(11, 1, v => a.push(createHand(v))); // Hard hands <12
    a.push(0);
    loop(2, 11, v => a.push(createHand(v, false, true))); // Pairs
    a.push(createHand(ACE, false, true));
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
  this.getCount = () => params.count;
  this.getComp = () => comp;
  this.getParams = () => params;
  this.getReturn = () => rdM;
  this.getReturnNoDouble = () => rM;
  this.getTable = getTable;
  this.createSimulation = createSimulation;
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
  this.getBJOdds = (dealer) => {
    let bjOdds = 0;
    if(dealer === ACE) {
      bjOdds = comp[DEALER_STATES.indexOf(DEALER_TEN)];
    } else if(dealer === 10) {
      bjOdds = comp[DEALER_STATES.indexOf(DEALER_ACE)];
    }
    return bjOdds;
  }
  this.getEdge = (j) => {
    if(j === undefined) {
      let edge = 0;
      loop(0, CARD_STATES.length, i => {
        edge += comp[i] * this.getEdge(i);
      });
      return 100 * edge;
    } else {
      let state = mpower(hitMatrix(comp), 2)[HAND_STATES.indexOf(0)];
      state[HAND_STATES.indexOf(BLACKJACK)] = state[HAND_STATES.indexOf(21)]; // 21 after 2 cards is blackjack
      state[HAND_STATES.indexOf(21)] = 0;
      let bjOdds = this.getBJOdds(CARD_STATES[j]);
      let r = dot(state, transpose(rdM)[j]);
      return r * (1 - bjOdds) - bjOdds;
    }
  }
  this.setParams = (params_) => {
    params = params_;
    determineMatrices();
    table = undefined; // Clear table
  }
  this.bestMove = (player, dealer, split) => {
    if(dealer === 10) dealer = DEALER_TEN;
    if(dealer === ACE) dealer = DEALER_ACE;
    return bestMove(player, dealer, split);
  };
  this.takeInsurance = () => {
    if(params.count.system === 'hilo') {
      /*
       * In systems where Aces and Tens are counted the same,
       * There's one more ten and one less ace than we think there is
       * Because the dealer has an Ace showing face up
       * */
      return comp[CARD_STATES.indexOf(10)] + 1/(52 * params.count.decks) > 1/3;
    } else {
      return comp[CARD_STATES.indexOf(10)] > 1/3;
    }
  }

  /*-- Private Variables --*/
  let comp;
  let endM, standM, doubleM;
  let table;

  // Return matrices. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return without doubling
  let rdM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with doubling
  let hitM = zeroes([HAND_STATES.length, DEALER_STATES.length]);
  let splitM = zeroes([DEALER_STATES.length, DEALER_STATES.length]);

  /*-- Determine Matrices --*/
  function determineMatrices() {
    comp = deckComp(params.count);

    // Calculate dealer's odds to reach each endstate
    endM = endMatrix(comp, params.soft17, params.count.decks * 52);

    // Calculate player's return by standing
    standM = standReturns(endM);
    // Set return on 21 to be return on stand because player must stand on 21
    loop(0, DEALER_STATES.length, i => {
      let j = HAND_STATES.indexOf(21);
      rdM[j][i] = rM[j][i] = standM[j][i];
      j = HAND_STATES.indexOf(BUST);
      rdM[j][i] = rM[j][i] = -1;
      j = HAND_STATES.indexOf(BLACKJACK);
      rdM[j][i] = rM[j][i] = 1.5;
    });

    // Calculate player's return by doubling
    doubleM = doubleReturns(standM, comp);
  }
  if(params) {
    determineMatrices();
  }

  /*-- Table generation --*/
  function getTable(player, dealer) {
    function exit() {
      if(player && dealer) {
        if(dealer === 'A' || dealer === ACE) dealer = DEALER_ACE;
        if(dealer === 10) dealer = DEALER_TEN;
        return table[TABLE_HANDS.indexOf(player)][DEALER_STATES.indexOf(dealer)];
      } else {
        return table;
      }
    }

    if(table) {
      return exit();
    }

    table = [];

    HAND_ORDER.forEach((player, i) => {
      if(player < 0) return;
      let pair = player & 0x40;
      let m = TABLE_HANDS.indexOf(player);
      let n = HAND_STATES.indexOf(player);
      if(m !== -1) {
        table[m] = [];
      }
      DEALER_STATES.forEach((dealer, j) => {
        let move = bestMove(player & 0x3f, dealer, pair);
        if(!pair) {
          rdM[n][j] = move[1];
          rM[n][j] = Math.max(standM[n][j], hitM[n][j]);
        }
        if(m !== -1) {
          table[m][j] = move;
        }
      });
    });

    return exit();
  }

  /*-- Move calculation --*/
  function bestMove(state, dealer, pair) {
    let j = DEALER_STATES.indexOf(dealer);

    // Calculate return by splitting
    let split = -Infinity;
    if(pair) {
      let r;
      if(params.split.oneCardAfterAce && state === ACE) {
        r = standM;
      } else if(params.split.double) {
        r = rdM;
      } else {
        r = rM;
      }
      split = splitReturns(findHand(state), transpose(r)[j], copy(comp), {cards:params.count.decks * 52});
      iDealer(splitM, state)[j] = split;
      state = pairState(state); // State before split
    }

    let i = HAND_STATES.indexOf(state);
    let stand = standM[i][j];
    let double = doubleM[i][j];

    // Calculate return by hitting
    let hit = hitReturns(i, transpose(rM)[j], comp);
    hitM[i][j] = hit;

    // Decide whether to surrender if possible
    let ret = Math.max(split, hit, stand, double); // Return of best move
    let sur = (params.surrender === 'late' || (params.surrender === 'early' && dealer !== DEALER_ACE && dealer !== DEALER_TEN)) &&
              ret < -.5;
    if(params.surrender === 'early' && dealer === DEALER_ACE) {
      let bjOdds = comp[DEALER_STATES.indexOf(DEALER_TEN)];
      sur = ret * (1 - bjOdds) - bjOdds < -.5;
    } else if(params.surrender === 'early' && dealer === DEALER_TEN) {
      let bjOdds = comp[DEALER_STATES.indexOf(DEALER_ACE)];
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

  /*-- Monte Carlo Simulation --*/
  function createSimulation(player, dealer, forceMove) {
    let p = elemsToIndices(player);
    let cards = Math.round(52 * params.count.decks);
    let compCopy = [];

    return {
      config: (p_, d) => {
        p = elemsToIndices(p_);
        dealer = d;
      },
      run: (n) => {
        let meanR = 0;
        let frequencies = {};
        if(player && !dealer) {
          dealer = player;
          player = undefined;
        }

        for(let i = 0; i < n; i++) {
          // Copy comp because playHand manipulates it
          compCopy = copy(comp);
          let r; // r * initial bet = money after hand
          r = playHand(compCopy, cards, {
            dealer: DEALER_STATES.indexOf(dealer),
            player: p,
            forceMove : forceMove
          });
          meanR += r / n;
          if(!frequencies[r]) {
            frequencies[r] = 1;
          } else {
            frequencies[r]++;
          }
        }
        frequencies.mean = meanR;
        return frequencies;
      }
    }

    // Converts an array of elements of CARD_STATES to indices
    function elemsToIndices(p) {
      if(!p) return p;
      let a = [];
      for(let i = 0; i < p.length; i++) {
        a[i] = CARD_STATES.indexOf(p[i]);
      }
      return a;
    }
  }

  // comp is a column vector representing the deck composition
  // cards are number of cards left in deck
  // options.dealer is the index of dealer card
  // options.player is a length 2 vector with the indices of the player cards
  // options.fixDealer prevents the dealer from hitting
  // options.forceMove dictates which move the player must play
  // options.noDouble
  function playHand(comp, cards, options) {
    if(typeof cards === 'number') {
      cards = { cards }; // Make it on object so we can reference it
    }
    if(!options) {
      options = {};
    }

    let dealer,   // Dealer hand
        player,   // Player hand
        pair,     // Boolean: if player hand is a pair
        state,    // Player state; the hand but with blackjack and pair information
        half;     // Half of the player value
    let double = false; // Whether or not we doubled

    const P = progressionMatrix();

    // Draw random dealer card if not specified
    if(options.dealer === undefined || options.dealer === -1) {
      options.dealer = drawCard(comp, cards);
    }
    dealer = DEALER_STATES[options.dealer];

    // Draw player cards
    let p = []; // List of player cards
    if(!options.player || options.player.length === 0) {
      p[0] = drawCard(comp, cards);
      p[1] = drawCard(comp, cards);
    } else {
      p[0] = options.player[0];
      p[1] = options.player[1];
    }

    // Determine player hand
    player = HAND_STATES.indexOf(0);
    for(let card of p) {
      player = HAND_STATES.indexOf(P[player][card]);
    }
    player = HAND_STATES[player];
    pair = p.length === 2 && p[0] === p[1];

    // Determine state
    if((CARD_STATES[p[0]] === 10 && CARD_STATES[p[1]] === ACE) || (CARD_STATES[p[1]] === 10 && CARD_STATES[p[0]] === ACE)) {
      // Player blackjack
      state = BLACKJACK;
    } else if(pair && player === 44) {
      // Pair of aces
      half = 11;
      state = createHand(half, true, true);
    } else if(pair) {
      // Pair of anything but aces
      half = player / 2;
      state = createHand(half, false, true);
    } else {
      state = player;
    }

    if(state !== BLACKJACK) {
      // Determine action
      let action;
      if(options.forceMove) {
        action = options.forceMove;
      } else {
        action = getTable(state, dealer)[0];
      }

      // Hand no doubling
      if(options.noDouble && action === 'D') {
        action = 'H';
      } else if(options.noDouble && action === 'd') {
        action = 'S';
      }

      // Do said action
      if(action === 'P') {
        if(!options.fixDealer) {
          dealer = simDealer(P, comp, cards, dealer);
        }
        // Fix dealer card because all splits happen on the same table
        let options_ = {
          player: [p[0], drawCard(comp, cards)],
          dealer: options.dealer,
          fixDealer: dealer,
          noDouble: !params.split.double
        };
        let r1 = playHand(comp, cards, options_);
        options.player = [p[1], drawCard(comp, cards)]
        let r2 = playHand(comp, cards, options_);
        if(r1 === 1.5) r1 = 1; // Blackjack after split isn't natural
        if(r2 === 1.5) r2 = 1;
        return r1 + r2;
      } else if(action === 'D' || action === 'd') {
        double = true;
        player = P[HAND_STATES.indexOf(player)][drawCard(comp, cards)];
      } else {
        // Hit until table says not to
        while(action === 'H') {
          player = P[HAND_STATES.indexOf(player)][drawCard(comp, cards)];
          if(player !== BUST) {
            action = getTable(player, dealer)[0];
          } else {
            break;
          }
        }
      }
    }

    if(player === BUST && double) {
      // Twice the losses for twice the bet
      return -2;
    } else if(player === BUST) {
      return -1;
    } else if(options.fixDealer) {
      dealer = options.fixDealer;
    } else {
      dealer = simDealer(P, comp, cards, dealer);
    }

    if(state === BLACKJACK && dealer === BLACKJACK) {
      return -1; // Player and dealer blackjack
    } else if(state === BLACKJACK) {
      return 1.5; // Player blackjack
    }

    let pv = getHandDetails(player)[0]; // Player value
    let dv = getHandDetails(dealer)[0]; // Dealer value
    if(pv > dv) {
      return double ? 2 : 1;
    } else if(pv === dv) {
      return 0;
    } else {
      // To account for peeking, we say doubling and losing is only -1 on dealer Blackjack
      return double && dv !== 22 ? -2 : -1;
    }
  }

  function drawCard(comp, cards) {
    let c = pickFromArray(comp);
    let newComp = pullCard(comp, c, cards.cards);
    for(let i = 0; i < comp.length; i++) {
      comp[i] = newComp[i];
    }
    cards.cards--;
    return c;
  }

  // Run dealer until it hits an endstate or bust
  function simDealer(P, comp, cards, dealer) {
    while((dealer & 0x1f) < 17 || dealer === DEALER_TEN || dealer === DEALER_ACE || (params.soft17 && dealer === 49)) {
      let nextCard = drawCard(comp, cards);
      dealer = P[HAND_STATES.indexOf(dealer)][nextCard];
    }
    return dealer;
  }

  /*-- High Level Functions --*/

  // Chance that we draw each card
  function deckComp(count) {
    // Composition for a deck with no cards pulled
    let baseComp = (() => {
      let a = fillArray(CARD_ODDS, 10);
      a[8] = TEN_ODDS;
      return a;
    })();
    switch(count.system) {
      case 'none':
        return baseComp;
      case 'hilo':
        return hiloComp(count);
      default:
        return baseComp;
    }
  }

  function hiloComp(count) {
    const TEN_HIGH_RATIO = 1 - ACE_HIGH_RATIO;

    let comp = [];
    loop(0, 10, i => {
      if(i === 9) {
        // Ace
        comp.push(CARD_ODDS + ACE_HIGH_RATIO * count.getTc() / 104);
      } else if(i === 8) {
        // 10
        comp.push(TEN_ODDS + TEN_HIGH_RATIO * count.getTc() / 104);
      } else if(i <= 5) {
        // 2-6
        comp.push(CARD_ODDS - count.getTc() / 520);
      } else {
        // 7-9
        comp.push(CARD_ODDS);
      }
    });
    return comp;
  }

  // P[state][card] = new state
  function progressionMatrix() {
    let a = [];

    HAND_STATES.forEach((hand, i) => {
      a[i] = [];
      let [value, soft] = getHandDetails(hand);
      CARD_STATES.forEach((card, j) => {
        let cardValue = card === ACE ? 1 : card;
        if((hand === DEALER_TEN && card === ACE) || (hand === DEALER_ACE && card === 10)) {
          // Blackjack
          a[i][j] = BLACKJACK;
        } else if(value + cardValue === 21 || (card === ACE && value === 10)) {
          // 21, but not blackjack
          a[i][j] = 21;
        } else if((card === ACE && value < 11)) {
          // <11 to soft hand
          a[i][j] = value + ACE;
        } else if(soft && value + cardValue > 21) {
          // Ace goes from 10 -> 1
          a[i][j] = value + cardValue - 10;
        } else if(value + cardValue > 21) {
          // Bust
          a[i][j] = BUST;
        } else {
          // hard -> hard or soft -> soft
          a[i][j] = value + cardValue + soft;
        }
      });
    });

    return a;
  }

  // Create transition matrix for the player on hit
  function hitMatrix(comp) {
    let P = progressionMatrix();

    let a = [];
    HAND_STATES.forEach((hand1, i) => {
      a[i] = [];
      HAND_STATES.forEach((hand2, j) =>
        a[i][j] = CARD_STATES.reduce((sum, card, k) =>
          sum + comp[k] * (P[i][k] === hand2), 0
        )
      );
    });

    return a;
  }

  function endMatrix(comp, soft17, cards) {
    let P = progressionMatrix();
    let states = [];
    let a = [];

    DEALER_STATES.forEach((dealer, c) => {
      // Initialize the state matrix
      states[c] = zeroes([HAND_STATES.length, CARD_STATES.length]);
      states[c][HAND_STATES.indexOf(dealer)] = comp;

      // Peeked cards have weighted chances
      let weight = 1;
      if(dealer === DEALER_TEN) {
        weight = 1 / (1 - comp[DEALER_STATES.indexOf(DEALER_ACE)]); // One ten. Dealer can't have an ace.
      } else if(dealer === DEALER_ACE) {
        weight = 1 / (1 - comp[DEALER_STATES.indexOf(DEALER_TEN)]); // One ace. Dealer can't have a 10.
      }

      // 12 is the maximum size for a blackjack hand
      for(let t = 0; t < 12; t++) {
        let newState = zeroes([HAND_STATES.length, CARD_STATES.length]);
        HAND_STATES.forEach((hand, I) => {
          HAND_STATES.forEach((hand_, i) => {
            let [value, soft] = getHandDetails(hand_);
            let endState = ((value >= 17 && !(value === 17 && soft && soft17)) || hand_ === BUST);
            CARD_STATES.forEach((card, j) => {
              // Skip Blackjack
              if((hand_ === DEALER_TEN && card === ACE) || (hand_ === DEALER_ACE && card === 10)) {
                return;
              }

              // If (card j) causes (state i) to transition to (state I)
              if((endState && i === I) || (!endState && P[i][j] === HAND_STATES[I])) {
                // Make sure (state i) is reachable from (dealer card c)
                let total = vtotal(states[c][i]);
                if(total > 0) {
                  // Shift the composition as if we pulled (card j)
                  let newComp = pullCard(states[c][i], j, cards - t);
                  // Weight the new odds if necessary
                  if(weight && (hand_ === DEALER_TEN || hand_ === DEALER_ACE)) {
                    newComp = vscale(newComp, weight);
                  }
                  // Add that deck distribution to (state I)
                  newState[I] = vsum(newState[I], vscale(newComp, states[c][i][j] / total));
                }
              }
            });
          });
        });
        states[c] = newState;
      }
    });

    DEALER_STATES.forEach((dealer, c) => {
      a[c] = squishState(states[c]);
    });

    // 2d matrtix -> 1d vector
    function squishState(state) {
      let v = [];
      HAND_STATES.forEach((hand, i) => {
        v[i] = 0;
        CARD_STATES.forEach((card, j) => {
          v[i] += state[i][j];
        });
      });
      return v;
    }

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
        let endOdds = endMatrix[j];
        let r = 0; // Return on bet

        endOdds.forEach((odds, k) => {
          let dHand = HAND_STATES[k];
          let v = getHandDetails(dHand)[0]; // Dealer value
          if(hand === BUST) {
            r -= odds;
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
  function hitReturns(i, r, comp) {
    return dot(hitMatrix(comp)[i], r);
  }

  // Calculate player's return by splitting
  function splitReturns(i, r, comp, cards, hands) {
    if(!hands) {
      hands = 1;
    }

    let j = CARD_STATES.indexOf(HAND_STATES[i]); // Card Index
    let hitReturns = vmultiply(hitMatrix(comp)[i], r);
    /*
     * The log2(maxHands) is an approximation that will always give a return below the actual return
     * It assumes that a hand can be split only to a depth of log2(maxHands),
     * however a hand can be split to a further depth if other hands aren't split
     * This approximation is only deals with multiple resplits,
     * and therefore doesn't affect the return much
     * */
    if(
      params.split.resplit &&
      hands <= Math.log2(params.split.maxHands) &&
      !(HAND_STATES[i] === ACE && !params.split.resplitAces)
    ) {
      comp = pullCard(comp, j, cards.cards);
      cards.cards--;
      let pairChance = comp[j];
      if(pairChance > 0) {
        let k = pairIndex(i);
        hitReturns[k] = pairChance * splitReturns(i, r, comp, cards, hands+1);
      }
    }
    return 2 * vtotal(hitReturns);
  }

  function doubleReturns(stand, comp) {
    let a = [];
    let H = hitMatrix(comp);
    HAND_STATES.forEach((hand, i) => {
      let hitState = H[i];
      a[i] = mmultiply(hitState, transpose(stand)).map(x => 2*x);
    });
    return a;
  }

  // Shift the deck distribution after pulling one card
  function pullCard(state, c, cards) {
    if(state[c] === 0) return zeroes([state.length]);
    let total = vtotal(state);
    state = vscale(state, 1/total); // Normalize the vector
    let newState = [];
    CARD_STATES.forEach((card, j) => {
      if(j === c) {
        newState[j] = (cards * state[j] - 1) / (cards - 1);
      } else {
        newState[j] = (cards * state[j]) / (cards - 1);
      }
    });
    return vscale(newState, total);
  }

  function createHand(value, soft, pair) {
    if(pair) value += 0x40;
    if(soft) value += 0x20;
    return value;
  }

  function getHandDetails(hand) {
    let value = 0,
        soft = false,
        pair = false;
    if(hand >= 0) {
      value = hand & 0x1f;
      soft = hand & 0x20;
      pair = hand & 0x40;
    } else if(hand === BLACKJACK) {
      value = 22;
    } else if(hand === BUST) {
      value = -999;
    } else if(hand === DEALER_TEN) {
      value = 10;
    } else if(hand === DEALER_ACE) {
      value = 11;
      soft = 0x20;
    }
    return [value, soft, pair];
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

  function pairState(state) {
    return state = state === ACE ? 44 : state * 2;
  }

  function pairIndex(i) {
    return HAND_STATES.indexOf(pairState(HAND_STATES[i]));
  }

  /*-- Logic Utility Functions --*/

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

  function copy(v) {
    let u = [];
    for(let i = 0; i < v.length; i++) {
      u[i] = v[i];
    }
    return u;
  }

  /*-- Mathy Utility Functions --*/

  function vtotal(u) {
    return u.reduce((r, x) => r + x, 0);
  }

  function vsum(u, v) {
    return u.map((x, i) => x + v[i]);
  }

  function vscale(u, c) {
    return u.map((x, i) => x * c);
  }

  function dot(u, v) {
    return u.reduce((r, x, i) => r + x * v[i], 0);
  }

  function vmultiply(u, v) {
    return u.map((x, i) => x * v[i]);
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

  // Picks random index from weighted probability array
  function pickFromArray(a) {
    let x = Math.random() * vtotal(a),
        i = 0;
    while(x > 0) {
      x -= a[i++ % a.length];
    }
    return i - 1;
  }

  // function checkNaN(x) {
  //   return (x !== x) === true;
  // }
}

export default Jackfish;
