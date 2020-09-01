/*-- Constants --*/

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

const HILO = [1, 1, 1, 1, 1, 0, 0, 0, -1, -1];
const KO = [1, 1, 1, 1, 1, 1, 1, 0, 0, -1, -1];
const OMEGA2 = [1, 1, 2, 2, 2, 1, 0, -1, -2, 0];
const WONGHALVES = [.5, 1, 1, 1.5, 1, .5, 0, -.5, -1, -1];
const USTONAPC = [1, 2, 2, 3, 2, 2, 1, -1, -3, 0];
const SYSTEM_NAMES = {
  'hilo': HILO,
  'ko': KO,
  'omega2': OMEGA2,
  'wonghalves': WONGHALVES,
  'ustonapc': USTONAPC
}

/*-- Private Variables --*/
let practiceParams = {};
let countTableRequested = false,
    perfectTableRequested = false,
    countEdge = null,
    perfectEdge = null,
    countTable = null,
    perfectTable = null,
    countInsurance = null,
    perfectInsurance = null,
    numBoxes = null;
let cvs, ctx,
  oldTime = 0,
  images = {},
  game = {},
  mouse = {};

function Main(params) {
  this.setPracticeParams = (practiceParams_) => {
    practiceParams = practiceParams_;
  }

  defineConstants.bind(this)([
    ['BLACKJACK', BLACKJACK],
    ['BUST', BUST],
    ['DEALER_TEN', DEALER_TEN],
    ['DEALER_ACE', DEALER_ACE],
    ['ACE', ACE],
  ], true);

  /*-- Private Functions --*/
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

  window.jackfish = this.jackfish = new window.Jackfish(params);
}

/*-- Practice --*/
window.startPractice = (jackfish) => {
  cvs = document.getElementById('cvs');
  if(cvs) {
    mouse = {};
    cvs.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX - cvs.getBoundingClientRect().x;
      mouse.y = e.clientY - cvs.getBoundingClientRect().y;
    });
    cvs.addEventListener('mousedown', (e) => {
      mouse.x = e.clientX - cvs.getBoundingClientRect().x;
      mouse.y = e.clientY - cvs.getBoundingClientRect().y;
      mouse.down = true;
    });

    function setSize() {
      if(cvs === null) return;
      cvs.width = cvs.clientWidth;
      cvs.height = cvs.clientHeight;
      if(cvs.width < 600) {
        numBoxes = 3;
      } else if(cvs.width < 800) {
        numBoxes = 4;
      } else {
        numBoxes = 5;
      }
    }
    window.addEventListener('resize', setSize);
    setSize();

    ctx = cvs.getContext('2d');
    loadImages(startFrameCycle.bind(jackfish));
  }
}

function loadImages(cb) {
  let images = {};
  let imagesLoaded = 0;

  function onloadImage() {
    if(++imagesLoaded >= 53) {
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
  } else if(++game.active === numBoxes && game.stage === STAGES.PLAYING) {
    game.dealCooldown = DEAL_COOLDOWN;
    game.active = null;
    game.stage = STAGES.REVEALING;
  } else if(game.active === numBoxes && game.stage === STAGES.INSURANCE) {
    // Peek ace showing
    if(window.jackfish.getParams().peek && getValue(game.dealer) === Infinity) {
      game.stage = STAGES.REVEALING;
      game.active = null;
    } else {
      game.active = 0;
      game.stage = STAGES.PLAYING;
      // Clear insurance
      game.insurance.forEach((bet, i) => {
        game.insurance[i] = false;
      })
    }
  }
}

let makingAITables = false;
let aiTables;
function generateAITables(hilo, omega, cb) {
  makingAITables = true;
  aiTables = {};

  let tc = -7;
  let system = 'hilo';

  let listener = this.jackfish.addListener('doAll', makeTable.bind(this));

  function makeTable() {
    // Don't generate tables that aren't necessary
    if(system === 'hilo' && !hilo) {
      system = 'omega2';
      tc = -13;
      makeTable.bind(this)();
      return;
    }
    if(system === 'omega2' && !omega) {
      makingAITables = false;
      this.jackfish.removeListener(listener);
      if(cb) {
        cb();
      }
      return;
    }

    // Store table
    if(!aiTables[system]) {
      aiTables[system] = {};
    }
    aiTables[system][tc] = deepCopy(this.jackfish.getTable());

    tc++;
    if(system === 'hilo' && tc > 6) {
      system = 'omega2';
      tc = -13;
      makeTable.bind(this)();
    } else if(system === 'omega2' && tc > 12) {
      makingAITables = false;
      this.removeListener(listener);
      if(cb) {
        cb();
      }
    } else {
      this.jackfish.setCount({
        system,
        tc,
        count: tc * game.count.decks / 2,
        decks: game.count.decks / 2
      }, true);
    }
  }
  makeTable.bind(this)();
}

function startFrameCycle(images_) {
  images = images_;
  oldTime = 0;
  game = {};
  game.new = () => {
    game.count = deepCopy(this.jackfish.getCount());
    game.cash = practiceParams.cash;
    game.originalBets = [0, 0, 0, 0, 0];
    game.bets = [0, 0, 0, 0, 0];
    game.decks = game.count.decks;
    game.shoe = new Shoe(this.jackfish);
    game.boxes = [];

    let anyCC = false;
    let anyAC = false;
    practiceParams.boxes.forEach(box => {
      anyCC |= box.ai && (box.difficulty === 'Casual Counter' || box.difficulty === 'Basic Strategy');
      anyAC |= box.ai && box.difficulty === 'Advanced Counter';
      game.boxes.push({
        ai: box.ai,
        difficulty: box.difficulty
      });
    });
    if(anyCC || anyAC) {
      generateAITables.bind(this)(anyCC, anyAC);
    }

    game.reset();
  }
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
        if(!game.boxes[i].ai) {
          game.cash -= bet - game.bets[i];
        }
        game.bets[i] = bet;
      }
    });

    // Reset if shoe is too small
    if(game.shoe.getSize() < 52 * practiceParams.penetration) {
      game.shoe = new Shoe(this.jackfish);
    }
  }
  game.new();

  frame.bind(this)(0);
}

function frame(time) {
  let pointer = false; // Should cursor be pointer?

  let delta = time - oldTime;
  oldTime = time;

  const CARD_WIDTH = cvs.width / 2.5 / numBoxes;
  const CARD_HEIGHT = 1056 * CARD_WIDTH / 691;

  function drawCard(card, x, y, n) {
    ctx.drawImage(
      images[card],
      cvs.width * x - CARD_WIDTH / 2 - n * CARD_WIDTH / 3,
      cvs.height * y + n * CARD_WIDTH / 3,
      CARD_WIDTH, CARD_HEIGHT
    );
  }

  function drawTotal(hand, x, y) {
    ctx.fillStyle = '#fff'
    ctx.font = '30px Noto Sans';
    let value = getValue(hand);
    if(value !== 0) {
      if(value === -1) {
        value = 'Bust';
      } else if(value === Infinity) {
        value = 'BJ';
      } else if(isSoft(hand)) {
        value = `${value - 10}/${value}`;
      }
      ctx.fillText(value, x - ctx.measureText(value).width / 2, y);
    }
  }

  function getReturn(pValue, dValue, natural) {
    if(pValue === Infinity && dValue !== Infinity) {
      return natural ? window.jackfish.getBlackjackPay() : 1;
    } else if(pValue > dValue) {
      return 1;
    } else if(pValue < dValue || pValue === -1) {
      return -1;
    } else {
      return 0;
    }
  }

  function playAI(level, getBet, getInsurance) {
    let move;
    switch(level) {
      case 'Basic Strategy':
        move = aiBasic(getBet, getInsurance);
        break;
      case 'Casual Counter':
        move = aiCasual(getBet, getInsurance);
        break;
      case 'Advanced Counter':
        move = aiAdvanced(getBet, getInsurance);
        break;
      case 'Perfect':
        move = aiPerfect(getBet, getInsurance);
        break;
      case 'Novice':
        move = aiNovice(getBet, getInsurance);
        break;
      default:
        move = null;
    }
    if(getBet) {
      return move;
    }
    if(getInsurance) {
      if(move) {
        window.doAction('Insurance', true);
      }
      return;
    }
    switch(move) {
      case 'P':
        if(!window.doAction('Split', true)) {
          window.doAction('Stand', true);
        }
        break;
      case 'D':
        if(!window.doAction('Double', true)) {
          window.doAction('Hit', true);
        }
        break;
      case 'd':
        if(!window.doAction('Double', true)) {
          window.doAction('Stand', true);
        }
        break;
      case 'H':
        window.doAction('Hit', true);
        break;
      case 'S':
        window.doAction('Stand', true);
        break;
      default:
    }
  }

  function aiNovice(getBet, getInsurance) {
    if(getBet) {
      return 10;
    }
    if(getInsurance) {
      return false;
    }
    let player = getValue(game.players[game.active]);
    let dealer = getValue(game.dealer);
    if(dealer <= 6 || game.players[game.active][0][0] === 'A') {
      return 'P';
    }
    if(player >= 16 || (player === 15 && dealer <= 6)) {
      return 'S';
    } else if(player === 11 || (player === 10 && dealer <= 10)) {
      return 'D';
    } else {
      return 'H';
    }
  }

  function aiBasic(getBet, getInsurance) {
    if(getBet) {
      return 10;
    }
    if(getInsurance) {
      return false;
    }
    return playTable(aiTables['hilo'][0]);
  }

  function aiCasual(getBet, getInsurance) {
    if(getBet) {
      if(game.shoe.getHiLo() > 6) {
        return 120;
      } else if(game.shoe.getHiLo() > 3) {
        return 60;
      } else if(game.shoe.getHiLo() > 1) {
        return 20;
      } else {
        return 10;
      }
    }
    if(getInsurance) {
      return game.shoe.getHiLo() >= 3;
    }

    let closest = null;
    let leastDistance = Infinity;
    Object.keys(aiTables['hilo']).forEach(key => {
      let distance = Math.abs(key - game.shoe.getHiLo());
      if(distance < leastDistance) {
        leastDistance = distance;
        closest = aiTables['hilo'][key];
      }
    });
    return playTable(closest);
  }

  function aiAdvanced(getBet, getInsurance) {
    if(getBet) {
      if(game.shoe.getOmega2() > 6) {
        return 600;
      } else if(game.shoe.getOmega2() > 4) {
        return 500;
      } else if(game.shoe.getOmega2() > 2) {
        return 200;
      } else if(game.shoe.getOmega2() > 1) {
        return 150;
      } else {
        return 100;
      }
    }
    if(getInsurance) {
      return game.shoe.getOmega2() > 4;
    }

    let closest = null;
    let leastDistance = Infinity;
    Object.keys(aiTables['omega2']).forEach(key => {
      let distance = Math.abs(key - game.shoe.getOmega2());
      if(distance < leastDistance) {
        leastDistance = distance;
        closest = aiTables['omega2'][key];
      }
    });
    return playTable(closest);
  }

  function aiPerfect(getBet, getInsurance) {
    if(getInsurance) {
      return game.shoe.getComp()[8] >= 1/3;
    }
    if(perfectTable !== null) {
      if(getBet) {
        if(perfectEdge > 0) {
          return 20 + Math.floor(perfectEdge * 200) * 10
        } else {
          return 10;
        }
      }
      return playTable(perfectTable);
    } else if(getBet) {
      return 10;
    } else {
      return null;
    }
  }

  function playTable(t) {
    let hand = getHand(game.players[game.active]);
    let tableIndex = TABLE_HANDS.indexOf(hand);
    let dealerIndex = DEALER_STATES.indexOf(getDealer(game.dealer));
    let bestMove;
    if(tableIndex !== -1 && dealerIndex !== -1) {
      bestMove = t[tableIndex][dealerIndex].action;
    } else {
      bestMove = 'S';
    }
    return bestMove;
  }

  // Determine which actions we can take
  let a = game.dealCooldown <= 0 && game.stage === STAGES.PLAYING;
  let b = game.dealCooldown <= 0 && game.stage > STAGES.BETTING && game.stage < STAGES.REVEALING;
  game.canHit = a && (
    (game.unfinished[game.active].length === 0 && game.finished[game.active].length === 0) ||
    game.players[game.active][0][0] !== 'A' ||
    !this.jackfish.getParams().split.oneCardAfterAce
  );
  game.canStand = a;
  game.canDouble = a && (
    (this.jackfish.getDoubleRules().anytime || game.players[game.active].length === 2) && // Double anytime
    getValue(game.players[game.active]) >= this.jackfish.getDoubleRules().min && // Minimum double
    (
      this.jackfish.getSplitRules().double ||
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
    game.unfinished[game.active].length + game.finished[game.active].length <= this.jackfish.getSplitRules().maxHands - 2 &&
    (
      this.jackfish.getSplitRules().resplit ||
      (game.unfinished[game.active].length === 0 && game.finished[game.active].length === 0)
    )
  );
  game.canSurrender = b && (
      (
        this.jackfish.getParams().surrender === 'late' &&
        game.players[game.active] &&
        game.players[game.active].length === 2 &&
        game.unfinished[game.active].length === 0 &&
        game.finished[game.active].length === 0 &&
        game.stage === STAGES.PLAYING
      ) ||
      (
        this.jackfish.getParams().surrender === 'early' &&
        game.stage === STAGES.INSURANCE
      )
  );
  game.canInsurance = b && (
    game.stage === STAGES.INSURANCE &&
    game.dealer[1][0] === 'A' &&
    game.cash >= game.bets[game.active] / 2
  );

  // Gray out buttons
  const ACTIONS = ['R', 'D', 'S', 'H', 'P', 'I'];
  let buttons = [game.canSurrender, game.canDouble, game.canStand, game.canHit, game.canSplit, game.canInsurance];
  buttons.forEach((activated, i) => {
    if(activated && !game.boxes[game.active].ai) {
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
  if(cvs.width < 420) {
    ctx.font = '20px Noto Sans';
  } else if(cvs.width < 1000) {
    ctx.font = '24px Noto Sans';
  }
  ctx.fillText(`${52 * game.decks - game.shoe.getSize()} cards discarded`, 20, 52);
  ctx.fillText(`${game.shoe.getSize()} cards left in shoe`, 20, 84);

  // Generate count and perfect tables
  if(countEdge === null && game.count.system !== 'none') {
    if(!countTableRequested) {
      if(!makingAITables) {
        this.jackfish.getCount().system = game.count.system;
        countTableRequested = true;
        this.jackfish.doAll();
        let listener = this.jackfish.addListener('doAll', () => {
          countEdge = this.jackfish.getEdge();
          countInsurance = this.jackfish.takeInsurance();
          countTable = deepCopy(this.jackfish.getTable());
          countTableRequested = false;
          this.jackfish.removeListener(listener);
        });
      }
    }
  } else if(perfectEdge === null) {
    if(!perfectTableRequested) {
      let count = this.jackfish.getCount();
      this.jackfish.setCount({
        system: 'perfect',
        comp: game.shoe.getComp(),
        count: count.count,
        tc: count.tc,
        decks: count.decks
      });

      perfectTableRequested = true;
      this.jackfish.doAll();
      let listener = this.jackfish.addListener('doAll', () => {
        perfectEdge = this.jackfish.getEdge();
        perfectInsurance = this.jackfish.takeInsurance();
        perfectTable = deepCopy(this.jackfish.getTable());
        perfectTableRequested = false;
        this.jackfish.removeListener(listener);
        this.jackfish.setCount(deepCopy(game.count));
      });
    }
  }

  // Determine best moves
  let countBestMove = null;
  let perfectBestMove = null;
  if(game.players[game.active] !== undefined) {
    let hand = getHand(game.players[game.active]);
    let tableIndex = TABLE_HANDS.indexOf(hand);
    let dealerIndex = DEALER_STATES.indexOf(getDealer(game.dealer));
    if(tableIndex !== -1 && dealerIndex !== -1) {
      if(countTable !== null) {
        countBestMove = countTable[tableIndex][dealerIndex].action;
      }
      if(perfectTable !== null) {
        perfectBestMove = perfectTable[tableIndex][dealerIndex].action;
      }
    }
  }

  // Update count in analysis
  window.updateCount(
    game.count.system,
    game.shoe.getCount(),
    Math.round(10 * game.shoe.getTrueCount()) / 10,
    countEdge,
    countBestMove,
    countInsurance
  );
  window.updatePerfect(
    perfectEdge,
    perfectBestMove,
    perfectInsurance
  );

  // Draw dealer cards
  game.dealer.forEach((card, i) => {
    if(
      i === 0 &&
      game.stage < STAGES.REVEALING
    ) {
      card = 'back';
    }
    if(cvs.width < 600) {
      drawCard(card, .5, .25, i);
    } else {
      drawCard(card, .5, .05, i);
    }
  });
  let visibleHand = game.dealer;
  if(game.stage < STAGES.REVEALING && game.dealer.length >= 2) {
    visibleHand = [game.dealer[1]];
  } else if(game.stage < STAGES.REVEALING) {
    visibleHand = [];
  }
  if(cvs.width < 600) {
    drawTotal(visibleHand, cvs.width / 2, cvs.height * .24);
  } else {
    drawTotal(visibleHand, cvs.width / 2, cvs.height * .04);
  }

  // Draw player cards
  game.players.forEach((player, i) => {
    if(game.active === null || game.active >= numBoxes || game.active === i) {
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = .2;
    }
    player.forEach((card, j) => {
      drawCard(card, (i+1)/(numBoxes+1) + CARD_WIDTH / cvs.width / (numBoxes+1), .55, j);
    });

    // Draw total
    drawTotal(player, cvs.width * (i+1)/(numBoxes+1), cvs.height * .54);

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
          this.jackfish.getSplitRules().oneCardAfterAce &&
          (game.players[i][1][0] !== 'A' || !this.jackfish.getSplitRules().resplitAces) &&
          game.players[i].length === 2
        ) ||
        // If less than table maximum, skip hand
        (game.stage > STAGES.BETTING && game.bets[i] < practiceParams.minimum) ||
        // If 21, bust, or blackjack, skip hand
        (
          game.stage === STAGES.PLAYING &&
          (getValue(player) === 21 || getValue(player) === Infinity || getValue(player) === -1) &&
          game.dealCooldown <= 0
        )
      )
    ) {
      finishHand();
    }
  });
  ctx.globalAlpha = 1;

  // Draw boxes
  for(let i = 0; i < numBoxes; i++) {
    let r = 32;
    let x = cvs.width * (i+1)/(numBoxes+1);
    let y = cvs.height - 2 * r;

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
        cvs.width * (i+1)/(numBoxes+1) - ctx.measureText(game.bets[i]).width / 2,
        y + 8
      );
    }
    if(game.boxes[i].ai) {
      ctx.fillText(
        'AI',
        cvs.width * (i+1)/(numBoxes+1) - ctx.measureText('AI').width / 2,
        y + r + 20
      );
    }

    // Hover and clicking events
    if(game.stage === STAGES.BETTING && !game.boxes[i].ai) {
      let hover = Math.pow(x - mouse.x, 2) + Math.pow(y - mouse.y, 2) < Math.pow(r, 2);
      if(hover && mouse.down) {
        pointer = true;
        game.active = i;
      } else if(hover) {
        pointer = true;
      }
    }
  }

  // Can't change the AI's bet
  if(
    game.stage === STAGES.BETTING &&
    game.active !== null &&
    game.boxes[game.active].ai
  ) {
    game.active = null;
  }

  // AI betting
  if(game.stage === STAGES.BETTING) {
    game.boxes.forEach((box, i) => {
      if(box.ai) {
        game.bets[i] = playAI(box.difficulty, true);
      }
    });
  }

  // AI playing
  if(game.stage === STAGES.PLAYING && game.boxes[game.active].ai) {
    playAI(game.boxes[game.active].difficulty);
  } else if(game.stage === STAGES.INSURANCE && game.boxes[game.active].ai) {
    playAI(game.boxes[game.active].difficulty, false, true);
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
      if(game.dealer[1][0] === 'A' || this.jackfish.getParams().surrender === 'early') {
        game.active = 0;
        game.stage = STAGES.INSURANCE;
        if(!game.boxes[0].ai) {
          game.generalCooldown = DEAL_COOLDOWN * 10;
        } else {
          game.generalCooldown = DEAL_COOLDOWN;
        }
      } else if(this.jackfish.getParams().peek && getValue(game.dealer) === Infinity) {
        // Peek 10 showing blackjack
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
    if(game.active !== null && !game.boxes[game.active].ai) {
      game.generalCooldown = DEAL_COOLDOWN * 10;
    } else {
      game.generalCooldown = DEAL_COOLDOWN;
    }
  }

  // If players are finished, do dealer
  if(game.stage === STAGES.REVEALING && game.dealCooldown <= 0) {
    let value = getValue(game.dealer);
    if((value < 17 || (this.jackfish.getParams().soft17 && value === 17 && isSoft(game.dealer))) && value !== -1) {
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
          game.bets[i] += 3 * game.insurance[i];
          game.insurance[i] = 0;
        }
      });
      game.finished.forEach((player, i) => {
        if(game.bets[i] < practiceParams.minimum || game.boxes[i].ai) return;
        player.forEach((hand, j) => {
          game.cash += game.finishedBets[i][j] * getReturn(getValue(hand), value, false);
          game.cash += game.finishedBets[i][j];
        });
      });
    }
  } else if(game.stage === STAGES.WAITING && game.dealCooldown <= 0) {
    game.reset();
  }

  text = null;
  if(game.stage === STAGES.BETTING) {
    text = 'Click to deal';
    if(makingAITables) {
      text = 'Making AI tables...';
    }
  } else if(game.stage === STAGES.INSURANCE && game.dealer[1][0] === 'A') {
    text = 'Insurance?';
  }
  if(text) {
    let fontSize = Math.floor(cvs.width / 8)
    ctx.fillStyle = '#fff';
    ctx.font = `${fontSize}px Noto Sans`;
    let width = ctx.measureText(text).width;
    let height = 96;
    let x = cvs.width / 2 - width / 2;
    let y = cvs.height * .2;
    ctx.fillText(text, x, y + height);

    // Click to deal events
    if(game.stage === STAGES.BETTING) {
      let hover = mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height;
      if(mouse.down && hover && !makingAITables) {
        pointer = true;
        game.stage = STAGES.DEALING;
        game.active = null;
      } else if(hover && !makingAITables) {
        pointer = true;
      }
    }
  }

  if(pointer) {
    cvs.style.cursor = 'pointer';
  } else {
    cvs.style.cursor = 'auto';
  }

  game.dealCooldown -= delta;
  game.generalCooldown -= delta;

  if(document.getElementById('cvs') !== null) {
    window.requestAnimationFrame(frame.bind(this));
  }

  mouse.down = false;
}

// A shoe that keeps count
function Shoe(jackfish) {
  let count = 0;
  let hilo = 0;
  let omega2 = 0;
  let cards = [];

  let comp = fillArray(4 * game.count.decks, 10);
  comp[CARD_STATES.indexOf(10)] *= 4;
  shuffle();

  this.draw = () => {
    if(cards.length === 0) {
      shuffle();
    }

    let card = cards.pop();
    comp[getCardIndex(card)]--; // Update comp
    if(game.count.system !== 'none') {
      const INDICES = SYSTEM_NAMES[game.count.system];
      count += INDICES[getCardIndex(card)];
      hilo += HILO[getCardIndex(card)];
      omega2 += OMEGA2[getCardIndex(card)];
      countEdge = null;
      countTable = null;
      updateCount();
    }
    perfectEdge = null;
    perfectTable = null;
    return card;
  }

  this.getSize = () => {
    return cards.length;
  }

  this.getCount = () => {
    return count;
  }

  this.getTrueCount = () => {
    return 52 * count / cards.length;
  }

  this.getHiLo = () => {
    return 52 * hilo / cards.length;
  }

  this.getOmega2 = () => {
    return 52 * omega2 / cards.length;
  }

  this.getComp = () => vnormalize(comp);

  function updateCount() {
    jackfish.getCount().count = count;
    jackfish.getCount().tc = 52 * count / cards.length;
    jackfish.getCount().decks = cards.length / 52;
  }
  updateCount();

  function shuffle() {
    // Create array of all cards in order
    let orderedCards = [];
    for(let i = 0; i < game.count.decks; i++) {
      IMAGE_KEYS.forEach(card => {
        orderedCards.push(card);
      });
    }

    // Randomly pick cards from ordered cards
    cards = [];
    while(orderedCards.length > 0) {
      let i = Math.floor(Math.random() * orderedCards.length);
      cards.push(orderedCards[i]);
      orderedCards.splice(i, 1);
    }
  }
}

/*-- Global functions --*/
window.addBet = (bet) => {
  if(game.stage === STAGES.BETTING) {
    if(bet === 0) {
      game.cash += game.bets[game.active];
      game.bets[game.active] = 0;
      game.originalBets[game.active] = 0;
    } else if(game.active !== null && game.cash >= bet) {
      game.cash -= bet;
      game.bets[game.active] += bet;
      game.originalBets[game.active] += bet;
    }
  }
}

window.doAction = (action, ai) => {
  if(
    game.active == null ||
    (game.boxes[game.active].ai && !ai) ||
    game.players[game.active].length < 2
  ) return;
  let didAction = false;
  switch(action) {
    case 'Hit':
      if(game.canHit) {
        didAction = true;
        game.players[game.active].push(game.shoe.draw());
        game.dealCooldown = DEAL_COOLDOWN;
      }
      break;
    case 'Stand':
      if(game.canStand) {
        didAction = true;
        finishHand();
      }
      break;
    case 'Double':
      if(game.canDouble) {
        didAction = true;
        if(!game.boxes[game.active].ai) {
          game.cash -= game.bets[game.active];
        }
        game.bets[game.active] *= 2;
        game.players[game.active].push(game.shoe.draw());
        finishHand();
      }
      break;
    case 'Split':
      if(game.canSplit) {
        didAction = true;
        // Create main hand and side hand
        game.unfinished[game.active].push([game.players[game.active][1]]);
        game.unfinishedBets[game.active].push(game.bets[game.active]);
        game.players[game.active] = [game.players[game.active][0]];
        if(!game.boxes[game.active].ai) {
          game.cash -= game.bets[game.active];
        }
        game.dealCooldown = DEAL_COOLDOWN;
      }
      break;
    case 'Surrender':
      if(game.canSurrender) {
        didAction = true;
        game.cash += game.bets[game.active] / 2;
        game.bets[game.active] = 0;
      }
      break;
    case 'Insurance':
      if(game.canInsurance) {
        didAction = true;
        game.insurance[game.active] = game.bets[game.active] / 2;
        if(!game.boxes[game.active].ai) {
          game.cash -= game.bets[game.active] / 2;
        }
        finishHand();
        if(game.active !== null && !game.boxes[game.active].ai) {
          game.generalCooldown = DEAL_COOLDOWN * 10;
        } else {
          game.generalCooldown = DEAL_COOLDOWN;
        }
      }
      break;
    default:
      break;
  }
  return didAction;
}

window.newGame = () => {
  game.new();
}

/*-- General Utility Functions --*/

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

function getDealer(cards) {
  if(cards.length < 2) {
    return -1;
  }
  let value = getValue([cards[1]]);
  if(value === 10) {
    return -3;
  } else if(value === 11) {
    return -4;
  } else {
    return value;
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

function getHand(cards) {
  let value = getValue(cards);
  if(isSoft(cards)) {
    value += 0x20;
  }
  if(cards.length === 2 && getValue([cards[0]]) === getValue([cards[1]])) {
    if(value === ACE + 1) {
      value = ACE;
    } else {
      value /= 2;
    }
    value += 0x40;
  }
  return value;
}

function getCardIndex(card) {
  if(card.startsWith('10') || card[0] === 'J' || card[0] === 'Q' || card[0] === 'K') {
    return CARD_STATES.indexOf(10);
  } else if(card[0] === 'A') {
    return CARD_STATES.indexOf(ACE);
  } else {
    return CARD_STATES.indexOf(Number(card[0]));
  }
}

/*-- Logic Utility Functions --*/

function deepCopy(obj) {
  if(typeof obj !== 'object') return obj;
  if(obj.length !== undefined) {
    let copy = [];
    obj.forEach(elem => {
      copy.push(deepCopy(elem));
    });
    return copy;
  } else {
    let copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepCopy(obj[key]);
    });
    return copy;
  }
}

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

/*-- Mathy Utility Functions --*/

function vnormalize(u) {
  return vscale(u, 1/vtotal(u));
}

function vtotal(u) {
  return u.reduce((r, x) => r + x, 0);
}

function vscale(u, c) {
  return u.map((x, i) => x * c);
}

export default Main;
