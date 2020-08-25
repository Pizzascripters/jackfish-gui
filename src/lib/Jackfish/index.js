function Jackfish(params) {
  /*-- Hand and card constants --*/

  // Like an enum, but we can't, because it's JavaScript
  const BLACKJACK = -1;
  const BUST = -2;
  const DEALER_TEN = -3;
  const DEALER_ACE = -4;
  const ACE = 43;

  const STAGES = {
    BETTING: 0,
    DEALING: 1,
    INSURANCE: 3,
    PLAYING: 4,
    REVEALING: 5, // Dealer reveals hole card and then hits
    WAITING: 6, // Dealer pays players and waits for next hand to start
  }

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

  const CARD_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const SUIT_NAMES = ['C', 'D', 'H', 'S'];
  const IMAGE_KEYS = (() => {
    let keys = [];
    CARD_NAMES.forEach((card) => {
      SUIT_NAMES.forEach((suit) => {
        keys.push(card + suit);
      });
    });
    return keys;
  })();
  const IMAGE_HREFS = (() => {
    let hrefs = {};
    CARD_NAMES.forEach((card) => {
      SUIT_NAMES.forEach((suit) => {
        hrefs[card + suit] = `cards/${card + suit}.png`;
      });
    });
    hrefs['back'] = 'cards/purple_back.png';
    return hrefs;
  })();

  const DEAL_COOLDOWN = 300; // ms

  /*-- Private Variables --*/
  let practiceParams = {};
  let comp;
  let endM, standM, doubleM;
  let table;
  let edge, insurance;
  let simCallback;
  let loaded = false;
  let listeners = [];
  let cvs, ctx,
    oldTime = 0,
    images = {},
    game = {},
    mouse = {};

  // Return matrices. Specifies return given player's hand and dealer's card under perfect play
  let rM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return without doubling
  // let rdM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with doubling
  let rsM = zeroes([HAND_STATES.length, DEALER_STATES.length]); // Return with surrendering
  let hitM = zeroes([HAND_STATES.length, DEALER_STATES.length]);
  let splitM = zeroes([DEALER_STATES.length, DEALER_STATES.length]);

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
  this.setPracticeParams = (practiceParams_) => {
    practiceParams = practiceParams_;
  }
  this.takeInsurance = () => insurance;
  this.createSimulation = (options) => {
    worker.postMessage(['createSimulation', [options]]);
  }
  this.updateSimulation = (options) => {
    worker.postMessage(['updateSimulation', [options]]);
  }
  this.runSimulation = (cb) => {
    simCallback = cb;
    worker.postMessage(['runSimulation', []]);
  }
  this.clearSimulation = (cb) => {
    simCallback = cb;
    worker.postMessage(['clearSimulation', []]);
  }
  this.stopSimulation = (cb) => {
    simCallback = cb;
    worker.postMessage(['stopSimulation', []]);
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

  /*-- Practice --*/
  window.addEventListener('load', e => {
    cvs = document.getElementById('cvs');
    if(cvs) {
      mouse = {};
      cvs.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX - cvs.getBoundingClientRect().x;
        mouse.y = e.clientY - cvs.getBoundingClientRect().y;
      });
      cvs.addEventListener('mousedown', (e) => {
        mouse.down = true;
      });
      cvs.addEventListener('mouseup', (e) => {
        mouse.down = false;
      });

      function setSize() {
        cvs.width = cvs.clientWidth;
        cvs.height = cvs.clientHeight;
      }
      window.addEventListener('resize', setSize);
      setSize();

      ctx = cvs.getContext('2d');
      loadImages(startFrameCycle.bind(this));
    }
  });

  function finishHand() {
    // If there's an unfinished side hand
    if(game.unfinished[game.active] && game.unfinished[game.active].length > 0) {
      game.dealCooldown = DEAL_COOLDOWN;
      setTimeout(() => {
        game.dealCooldown = DEAL_COOLDOWN;
        game.finished[game.active].push(game.players[game.active]);
        game.finishedBets[game.active].push(game.bets[game.active]);
        game.players[game.active] = game.unfinished[game.active].pop();
        game.bets[game.active] = game.unfinishedBets[game.active].pop();
      }, DEAL_COOLDOWN);
    } else if(++game.active === 5 && game.stage === STAGES.PLAYING) {
      game.dealCooldown = DEAL_COOLDOWN;
      game.active = null;
      game.stage = STAGES.REVEALING;
    } else if(game.active === 5 && game.stage === STAGES.INSURANCE) {
      game.active = 0;
      game.stage = STAGES.PLAYING;
    }
  }

  function startFrameCycle(images_) {
    images = images_;
    oldTime = 0;
    game = {
      cash: practiceParams.cash,
      originalBets: [0, 0, 0, 0, 0],
      bets: [0, 0, 0, 0, 0],
      shoe: new Shoe()
    };
    game.reset = () => {
      game.stage = STAGES.BETTING;
      game.dealer = [];
      game.peeked = false;
      game.insurance = [false, false, false, false, false];
      game.players = [[], [], [], [], []];
      game.unfinished = [[], [], [], [], []]; // Unfinished side hands; where hands go after a split
      game.finished = [[], [], [], [], []]; // Finished side hands
      game.unfinishedBets = [[], [], [], [], []]; // Bets corresponding with game.unfinished
      game.finishedBets = [[], [], [], [], []]; // Best correspondinng with game.finished
      game.active = 0; // Which player is currently playing
      game.generalCooldown = 0;
      game.dealCooldown = 0;

      game.originalBets.forEach((bet, i) => {
        if(game.cash >= bet - game.bets[i]) {
          game.cash -= bet - game.bets[i];
          game.bets[i] = bet;
        }
      })
    }
    game.reset();

    frame.bind(this)(0);
  }

  function frame(time) {
    let pointer = false; // Should cursor be pointer?

    let delta = time - oldTime;
    oldTime = time;

    const CARD_WIDTH = cvs.width / 12;
    const CARD_HEIGHT = 1056 * CARD_WIDTH / 691;

    function drawCard(card, x, y, n) {
      ctx.drawImage(
        images[card],
        cvs.width * x - CARD_WIDTH / 2 - n * CARD_WIDTH / 3,
        cvs.height * y + n * CARD_WIDTH / 3,
        CARD_WIDTH, CARD_HEIGHT
      );
    }

    function getReturn(pValue, dValue, natural) {
      if(pValue === Infinity && dValue !== Infinity) {
        return natural ? params.blackjack : 1;
      } else if(pValue > dValue) {
        return 1;
      } else if(pValue < dValue || pValue === -1) {
        return -1;
      } else {
        return 0;
      }
    }

    // Determine which actions we can take
    let a = game.dealCooldown <= 0 && game.stage === STAGES.PLAYING;
    let b = game.dealCooldown <= 0 && game.stage > STAGES.BETTING && game.stage < STAGES.REVEALING;
    game.canHit = a && (
      (game.unfinished[game.active].length === 0 && game.finished[game.active].length === 0) ||
      game.players[game.active][0][0] !== 'A' ||
      !params.split.oneCardAfterAce
    );
    game.canStand = a;
    game.canDouble = a && (
      (params.double.anytime || game.players[game.active].length === 2) && // Double anytime
      getValue(game.players[game.active]) >= params.double.min && // Minimum double
      (
        params.split.double ||
        (
          game.unfinished[game.active].length === 0 &&
          game.finished[game.active].length === 0
        ) // Double after split
      ) &&
      game.cash >= game.bets[game.active]
    );
    game.canSplit = a && (
      game.players[game.active].length === 2 &&
      getValue([game.players[game.active][0]]) === getValue([game.players[game.active][1]]) &&
      game.cash >= game.bets[game.active] &&
      game.unfinished[game.active].length + game.finished[game.active].length <= params.split.maxHands - 2 &&
      (
        params.split.resplit ||
        (game.unfinished[game.active].length === 0 && game.finished[game.active].length === 0)
      )
    );
    game.canSurrender = b && (
        (
          params.surrender === 'late' &&
          game.players[game.active].length === 2 &&
          game.unfinished[game.active].length === 0 &&
          game.finished[game.active].length === 0 &&
          game.stage === STAGES.PLAYING
        ) ||
        (
          params.surrender === 'early' &&
          game.stage === STAGES.INSURANCE
        )
    );
    game.canInsurance = b && (
      game.stage === STAGES.INSURANCE &&
      game.cash >= game.bets[game.active] / 2
    );

    // Gray out buttons
    const ACTIONS = ['R', 'D', 'S', 'H', 'P', 'I'];
    let buttons = [game.canSurrender, game.canDouble, game.canStand, game.canHit, game.canSplit, game.canInsurance];
    buttons.forEach((activated, i) => {
      if(activated) {
        window.activateAction(ACTIONS[i]);
      } else {
        window.grayAction(ACTIONS[i]);
      }

    });

    // Draw background
    ctx.fillStyle = '#030';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Draw info text
    ctx.fillStyle = '#fff';
    ctx.font = '42px Noto Sans';
    let text = `$${game.cash}`;
    ctx.fillText(text, cvs.width - ctx.measureText(text).width - 20, 62);
    ctx.font = '32px Noto Sans';
    ctx.fillText(`${52 * params.count.decks - game.shoe.getSize()} cards discarded`, 20, 52);
    ctx.fillText(`${game.shoe.getSize()} cards left in shoe`, 20, 84);

    // Draw dealer cards
    game.dealer.forEach((card, i) => {
      if(
        i === 0 &&
        game.stage < STAGES.REVEALING
      ) {
        card = 'back';
      }
      drawCard(card, .5, .02, i);
    });

    // Draw player cards
    game.players.forEach((player, i) => {
      if(game.active === null || game.active >= 5 || game.active === i) {
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = .2;
      }
      player.forEach((card, j) => {
        drawCard(card, (i+1)/6 + CARD_WIDTH / cvs.width / 6, .55, j);
      });

      // Check if player is 21 or bust or not betting
      if(
        // One card after ace
        game.dealCooldown <= 0 &&
        game.active === i &&
        (
          // If one card after ace split and can't resplit, skip hand
          (
            (game.unfinished[i].length > 0 || game.finished[i].length > 0) && // After split
            game.players[i][0] &&
            game.players[i][1] &&
            game.players[i][0][0] === 'A' && // First card is ace
            params.split.oneCardAfterAce &&
            (game.players[i][1][0] !== 'A' || !params.split.resplitAces) &&
            game.players[i].length === 2
          ) ||
          // If less than table maximum, skip hand
          (game.stage > STAGES.BETTING && game.bets[i] < practiceParams.minimum) ||
          // If 21, bust, or blackjack, skip hand
          ((getValue(player) === 21 || getValue(player) === Infinity || getValue(player) === -1) && game.dealCooldown <= 0)
        )
      ) {
        finishHand();
      }
    });
    ctx.globalAlpha = 1;

    // Draw boxes
    for(let i = 0; i < 5; i++) {
      let x = cvs.width * (i+1)/6;
      let y = cvs.height * .9;
      let r = cvs.height * .05;

      ctx.strokeStyle = game.insurance[i] ? '#f77' : '#fff';
      if(game.active === i) {
        ctx.lineWidth = 5;
      } else {
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2*Math.PI);
      ctx.stroke();
      ctx.font = '20px Noto Sans';
      ctx.fillStyle = '#fff';
      if(game.bets[i] !== 0) {
        ctx.fillText(
          game.bets[i],
          cvs.width * (i+1)/6 - ctx.measureText(game.bets[i]).width / 2,
          cvs.height * .9 + 8
        );
      }

      // Hover and clicking events
      if(game.stage === STAGES.BETTING) {
        let hover = Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2) < Math.pow(r, 2);
        if(hover && mouse.down) {
          pointer = true;
          game.active = i;
        } else if(hover) {
          pointer = true;
        }
      }
    }

    // Reset if shoe is too small
    if(game.shoe.length < 52) {
      game.reset();
    }

    // Deal if dealing hasn't finished
    if(game.stage === STAGES.DEALING) {
      let finishedPlayers = true;
      let finishedDealing = true;
      let minSize = Math.min(...game.players.map((player, i) => {
        if(game.bets[i] < practiceParams.minimum) {
          return Infinity;
        } else {
          return player.length;
        }
      }));
      // Deal to each player
      game.players.forEach((player, i) => {
        if(
          game.bets[i] >= practiceParams.minimum && // Must be betting at least table minimum
          player.length === minSize && // Deal if we have the smallest hand
          minSize < 2 // Smallest hand must be less than 2 cards, else we're done dealing
        ) {
          finishedPlayers = false;
          finishedDealing = false;
          if(game.dealCooldown <= 0) {
            player.push(game.shoe.draw());
            game.dealCooldown = DEAL_COOLDOWN;
          }
        }
      });
      // Deal to dealer
      if(finishedPlayers && game.dealer.length < 2) {
        finishedDealing = false;
        if(game.dealCooldown <= 0) {
          game.dealCooldown = DEAL_COOLDOWN;
          game.dealer.push(game.shoe.draw());
        }
      }

      if(game.stage === STAGES.DEALING && finishedDealing && game.dealCooldown <= 0) {
        if(game.dealer[1][0] === 'A' || params.surrender === 'early') {
          game.active = 0;
          game.stage = STAGES.INSURANCE;
          game.generalCooldown = DEAL_COOLDOWN * 10;
        } else if(params.peek && getValue(game.dealer) === Infinity) {
          // Peek cards
          game.stage = STAGES.REVEALING;
          game.active = null;
        } else {
          game.active = 0;
          game.stage = STAGES.PLAYING;
        }
      }
    }

    // Draw second card after split
    if(game.stage === STAGES.PLAYING) {
      if(
        game.players[game.active].length === 1 &&
        game.dealCooldown <= 0
      ) {
        game.players[game.active].push(game.shoe.draw());
        game.dealCooldown = DEAL_COOLDOWN;
      }
    }

    // Early surrendering and insurance expires
    if(
      (game.stage === STAGES.INSURANCE) &&
      game.bets[game.active] >= practiceParams.minimum &&
      game.generalCooldown <= 0
    ) {
      finishHand();
      game.generalCooldown = DEAL_COOLDOWN * 10;
    }

    // If players are finished, do dealer
    if(game.stage === STAGES.REVEALING && game.dealCooldown <= 0) {
      let value = getValue(game.dealer);
      if((value < 17 || (params.soft17 && value === 17 && isSoft(game.dealer))) && value !== -1) {
        game.dealer.push(game.shoe.draw());
        game.dealCooldown = DEAL_COOLDOWN;
      } else {
        game.stage = STAGES.WAITING;
        game.dealCooldown = DEAL_COOLDOWN * 10;

        // Update cash
        game.players.forEach((player, i) => {
          if(game.bets[i] < practiceParams.minimum) return;
          let change = game.bets[i] * getReturn(getValue(player), value, game.finished[i].length === 0);
          game.bets[i] += change;

          if(game.insurance[i] && getValue(game.dealer) === Infinity) {
            game.bets[i] += 2 * game.insurance[i];
          }
        });
        game.finished.forEach((player, i) => {
          if(game.bets[i] < practiceParams.minimum) return;
          player.forEach((hand, j) => {
            game.cash += game.finishedBets[i][j] * getReturn(getValue(hand), value, false);
            game.cash += game.finishedBets[i][j];
          });
        });
      }
    } else if(game.stage === STAGES.WAITING && game.dealCooldown <= 0) {
      game.reset();
    }

    if(game.stage === STAGES.BETTING) {
      ctx.fillStyle = '#fff';
      ctx.font = '96px Noto Sans';
      let text = 'Click to deal';

      let width = ctx.measureText(text).width;
      let height = 96;
      let x = cvs.width / 2 - width / 2;
      let y = cvs.height * .2;
      ctx.fillText(text, x, y + height);

      let hover = mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height;
      if(mouse.down && hover) {
        pointer = true;
        game.stage = STAGES.DEALING;
        game.active = null;
      } else if(hover) {
        pointer = true;
      }
    }

    if(pointer) {
      cvs.style.cursor = 'pointer';
    } else {
      cvs.style.cursor = 'auto';
    }

    game.dealCooldown -= delta;
    game.generalCooldown -= delta;
    window.requestAnimationFrame(frame.bind(this));
  }

  function loadImages(cb) {
    let images = {};
    let imagesLoaded = 0;

    function onloadImage() {
      if(++imagesLoaded >= 52) {
        cb(images);
      }
    }

    Object.keys(IMAGE_HREFS).forEach(key => {
      let img = new Image();
      img.src = 'img/' + IMAGE_HREFS[key];
      img.onload = onloadImage;
      images[key] = img;
    });
  }

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
    } else if(e.data[0].endsWith('Simulation')) {
      if(simCallback) simCallback(e.data[1]);
    }
  });

  /*-- Private Functions --*/
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

  function Shoe() {
    let orderedCards = [];
    for(let i = 0; i < params.count.decks; i++) {
      IMAGE_KEYS.forEach(card => {
        orderedCards.push(card);
      });
    }

    let cards = [];
    while(orderedCards.length > 0) {
      let i = Math.floor(Math.random() * orderedCards.length);
      cards.push(orderedCards[i]);
      orderedCards.splice(i, 1);
    }

    this.draw = () => {
      return cards.pop();
    }

    this.getSize = () => {
      return cards.length;
    }
  }

  function createHand(value, soft, pair) {
    if(pair) value += 0x40;
    if(soft) value += 0x20;
    return value;
  }

  function getValue(cards) {
    if(cards.length === 0) return 0;
    cards = cards.map(card => {
      if(card[1] === '0' || card[0] === 'J' || card[0] === 'Q' || card[0] === 'K') {
        return 10;
      } else if(card[0] === 'A') {
        return 1;
      } else {
        return Number(card[0]);
      }
    });
    let sum = cards.reduce((acc, card) => acc + card);
    if(cards.indexOf(1) !== -1 && sum <= 11) {
      sum += 10;
    }
    if(sum === 21 && cards.length === 2) {
      return Infinity; // Blackjack
    } else if(sum > 21) {
      return -1; // Bust
    } else {
      return sum;
    }
  }

  function isSoft(cards) {
    if(cards.length === 0) return 0;
    cards = cards.map(card => {
      if(card[1] === '0' || card[0] === 'J' || card[0] === 'Q' || card[0] === 'K') {
        return 10;
      } else if(card[0] === 'A') {
        return 1;
      } else {
        return Number(card[0]);
      }
    });
    let sum = cards.reduce((acc, card) => acc + card);
    if(cards.indexOf(1) !== -1 && sum <= 11) {
      return true;
    }
    return false;
  }

  /*-- Global functions --*/
  window.addBet = (bet) => {
    if(game.stage === STAGES.BETTING) {
      if(bet === 0) {
        game.cash += game.bets[game.active];
        game.bets[game.active] = 0;
        game.originalBets[game.active] = 0;
      } else {
        if(game.cash >= bet) {
          game.cash -= bet;
          game.bets[game.active] += bet;
          game.originalBets[game.active] += bet;
        }
      }
    }
  }

  window.doAction = (action) => {
    switch(action) {
      case 'Hit':
        if(game.canHit) {
          game.players[game.active].push(game.shoe.draw());
          game.dealCooldown = DEAL_COOLDOWN;
        }
        break;
      case 'Stand':
        finishHand();
        break;
      case 'Double':
        if(game.canDouble) {
          game.cash -= game.bets[game.active];
          game.bets[game.active] *= 2;
          game.players[game.active].push(game.shoe.draw());
          finishHand();
        }
        break;
      case 'Split':
        if(game.canSplit) {
          // Create main hand and side hand
          game.unfinished[game.active].push([game.players[game.active][1]]);
          game.unfinishedBets[game.active].push(game.bets[game.active]);
          game.players[game.active] = [game.players[game.active][0]];
          game.cash -= game.bets[game.active];
          game.dealCooldown = DEAL_COOLDOWN;
        }
        break;
      case 'Surrender':
        if(game.canSurrender) {
          game.cash += game.bets[game.active] / 2;
          game.bets[game.active] = 0;
        }
        break;
      case 'Insurance':
        if(game.canInsurance) {
          game.insurance[game.active] = game.bets[game.active] / 2;
          game.cash -= game.bets[game.active] / 2;
          finishHand();
          game.generalCooldown = DEAL_COOLDOWN * 10;
        }
        break;
      default:
        break;
    }
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
