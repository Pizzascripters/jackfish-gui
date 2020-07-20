const CARD_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const PLAYER_HANDS = (() => {
  let hard = [],
      soft = [],
      splits = [];
  for(let v = 2; v <= 20; v++) {
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

// Maps values to card names
const VALUE_MAP = (() => {
  let o = {};
  for(let v = 2; v <= 10; v++) {
    o[v] = CARD_NAMES[v-2];
  }
  o[43] = 'A';
  return o;
})();

/* Graphical constants */
const TABLE_MARGIN = 50;
const COLOR_MAP = {
  'H': '#ff0000',
  'D': '#0000ff',
  'd': '#00ffff',
  'S': '#ffff00',
  'P': '#00ff00',
  'R': '#ffffff',
}

let engine; // ONLY FOR DEBUGGING. REMOVE IN PRODUCTION
function init() {
  const cvs = document.getElementById('cvs');
  const ctx = cvs.getContext('2d');

  document.body.style.margin = '0px';
  document.body.style.overflow = 'hidden';

  function fullscreen() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  }
  window.addEventListener('resize', fullscreen);
  fullscreen();

  engine = new Engine({
    count: new Count('hilo', 0, 2),
    soft17: true,
    spanish: false,
  }); // USE LET IN PRODUCTION

  frame.bind(engine, ctx)();
}

function frame(ctx) {
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textBaseline = 'middle';
  let spacing = (cvs.height - 2*TABLE_MARGIN) / (NUM_PLAYER_HANDS+3); // Size of one box

  // Column headers
  let x = 100 + spacing;
  for(let card of CARD_NAMES) {
    let w = ctx.measureText(card).width;
    ctx.fillText(card, x + spacing/2 - w/2, TABLE_MARGIN);
    x += spacing;
  }

  // Row headers
  let y = TABLE_MARGIN + spacing;
  for(let handGroup of PLAYER_HANDS) {
    for(let hand of handGroup) {
      ctx.fillText(hand, 100, y + spacing/2);
      y += spacing;
    }
    y += spacing;
  }

  function drawSquare(action, x, y) {
    ctx.fillStyle = COLOR_MAP[action];
    ctx.fillRect(100 + spacing*(x+1), TABLE_MARGIN + spacing*(y+1), spacing, spacing);
  }
  drawSquare('H', 0, 0);
  drawSquare('D', 1, 0);
  drawSquare('d', 0, 1);
  drawSquare('S', 1, 1);

  window.requestAnimationFrame(frame.bind(this, ctx));
}

window.addEventListener('load', init);
