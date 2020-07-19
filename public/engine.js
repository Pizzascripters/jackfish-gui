// A list of possible hands the player or the dealer can have
const handStates = (() => {
  let a = [];
  // Soft hands
  for(let v = 11; v <= 20; v++) {
    a.push(dealerHand(v, true));
  }
  // Hard hands
  for(let v = 2; v <= 21; v++) {
    a.push(dealerHand(v, false));
  }
  a.push(-1, -2, -3); // Blackjack, bust, and no cards respectively

  return a;
})();

// Create transition matrix for the dealer
function dealerMatrix(soft17, spanish) {
  // soft17 is true if dealer hits
  
}

function dealerHand(value, soft) {
  return soft*32 + value;
}
