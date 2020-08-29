# Jackfish
A JavaScript engine for determining player edge and perfect strategy for standard blackjack given rule variations and counting systems.

## Installation
Add ```Jackfish.js``` and ```JackfishWorker.js``` to your project directory.
Add the following line of code to your html file:

```<script type='text/javascript' src='Jackfish.js'></script>```

## Example
```JavaScript
let params = {
  blackjack: 1.5, // 3:2 pay
  peek: true, // Peek hole card
  soft17: true, // Hits soft 17
  surrender: 'late',
  count: {
    system: 'hilo',
    count: 12,
    tc: 4, // True Count
    decks: 3
  },
  double: {
    anytime: false,
    min: 9
  },
  split: {
    double: true, // Double after split
    maxHands: 4,
    oneCardAfterAce: true,
    resplit: true,
    resplitAces: true
  }
}

let jackfish = new Jackfish(params);
jackfish.doAll();
jackfish.getEdge();              // 0.0131955171757095
jackfish.takeInsurance();        // true
jackfish.getHit(16, 9),          // -0.5093939657864434
jackfish.getStand(16, 9)         // -0.5414794109351144
jackfish.getTable(16, 9).action; // "S"
```

## Contributions
Contributions are open and welcome! There are many more rule variants and game variants (eg. Free Bet Blackjack) that Jackfish has not yet implemented. If your local casino uses a variant not currently supported by Jackfish, feel free to create a pull request!

## License
MIT License

Copyright (c) 2020 Niklas Olson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
