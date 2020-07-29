// Constructor for the count
function Count(system, count, decks) {
  this.system = system;
  this.count = count;
  this.decks = decks;

  // True count
  this.getTc = () => this.count / this.decks;
}

export default Count;
