// Constructor for the count
function Count(system, tc, decks) {
  this.system = system;
  this.tc = tc;
  this.decks = decks;

  this.count = tc * decks;
  this.card = 52 * decks;
}

export default Count;
