const CARD_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const PLAYER_HANDS = (() => {
  let hard = [],
      soft = [],
      splits = [];
  for(let v = 5; v <= 20; v++) {
    hard.push(String(v));
  }
  for(let v = 12; v <= 20; v++) {
    soft.push(String(v));
  }
  for(let card of CARD_NAMES) {
    splits.push(String(`${card},${card}`));
  }
  return [hard, soft, splits];
})();
const NUM_PLAYER_HANDS = PLAYER_HANDS.map(x => x.length).reduce((a, b) => a + b);

// Maps values to card and hand names
const VALUE_MAP = (() => {
  let o = {};
  for(let v = 2; v <= 20; v++) {
    o[v] = String(v);
  }
  for(let v = 12; v <= 20; v++) {
    o[v+32] = String(v)+'\'';
  }
  for(let v = 2; v <= 10; v++) {
    o[v+64] = String(v)+',';
  }
  o[43] = o[1] = 'A';
  o[107] = 'A,';
  return o;
})();

// Maps jackfish actions to table actions
const ACTION_MAP = {
  'H': 'H',
  'S': 'S',
  'D': 'Dh',
  'd': 'Ds',
  'P': 'P',
  'RH': 'Rh',
  'RS': 'Rs',
  'RP': 'Rp'
}
const ACTION_CLASSES = {
  'H': 'hit',
  'S': 'stand',
  'Dh': 'doublehit',
  'Ds': 'doublestand',
  'P': 'split',
  'Rh': 'surrenderhit',
  'Rs': 'surrenderstand',
  'Rp': 'surrendersplit'
}

/* Graphical constants */
const TABLE_MARGIN = 50;
const COLOR_MAP = {
  'H': '#ff0000',
  'D': '#0000ff',
  'd': '#00ffff',
  'S': '#ffff00',
  'P': '#00ff00',
  'Rd': '#ccffff',
  'RD': '#ccccff',
  'RH': '#cccccc',
  'RP': '#ccffcc',
  'RS': '#f0f0f0'
}

let jackfish;
function init() {
  render.bind(jackfish = new Jackfish({
    count: new Count('hilo', 0, 1),
    soft17: true,
    surrender: 'none',
    doubleAfterSplit: true
  }))();
}

function render() {
  function drawSquare(cell, player, dealer) {
    let action = cell[0]
    if(cell[2]) {
      action = 'R' + cell[0];
    }
    action = ACTION_MAP[action];
    let box = document.getElementById(`${player}-${dealer}`);
    box.className = ACTION_CLASSES[action];
    box.innerText = action;
  }

  // Cells
  let table = this.getTable();
  table.forEach((row, i) => {
    row.forEach((cell, j) => {
      if(i <= 30) {
        let hand = HAND_STATES[i]; // Player hand
        let card = CARD_STATES[j]; // Dealer card
        let [value, soft] = getHandDetails(hand);

        if(hand > 4 && hand !== 43 && hand !== 21) {
          drawSquare(cell, VALUE_MAP[hand], VALUE_MAP[card]);
        }
      } else {
        let hand = VALUE_MAP[i - 32] + ',' + VALUE_MAP[i - 32]; // Player hand
        let card = VALUE_MAP[CARD_STATES[j]]; // Dealer card

        drawSquare(cell, hand, card);
      }
    });
  });
}

window.addEventListener('load', init);
