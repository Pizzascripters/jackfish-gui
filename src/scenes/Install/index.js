import React from 'react';
import CodeBlock from '../../components/CodeBlock';
import './style.css';

class Install extends React.Component {
  render() {
    return <div id='install'>
      <div id='install-instructions'>
        <h1 className='center'>Installation</h1><br />
        <h2 className='center'>Download the
           <a href='js/Jackfish/JackfishWorker.js'>worker script</a>
          and the
           <a href='js/Jackfish/Jackfish.js'>main script</a>
           and place them in your project directory.
        </h2>
        <h2 className='center'>Include the script in your html</h2>
        <CodeBlock language='html' text="<script type='text/javascript' src='path/to/Jackfish.js'></script>" />
      </div>
      <div id='usage'>
        <h1 className='center'>Usage</h1><br />
        <h2 className='center'>Initialization</h2>
        <CodeBlock language='javascript' text={"let params = {\n\tsoft17: false, // S17\n\tblackjack: 1.2, // 6:5\n\tsplit: {\n\t\tdouble: false // No double after split\n\t}\n};\n\nlet jackfish = new Jackfish(params);"} />
        <h2 className='center'>Creating Hands</h2>
        <CodeBlock language='javascript' text={"jackfish.createHand(14) // Hard 14\njackfish.createHand(14, true) // Soft 14\njackfish.createHand(7, false, true) // Pair of 7s\njackfish.createHand(11, true, true) // Pair of Aces\n\n14 // Hard 14\n14 + jackfish.SOFT // Soft 14\n7 + jackfish.PAIR // Pair of 7s\n11 + jackfish.SOFT + jackfish.PAIR // Pair of Aces\njackfish.ACE + jackfish.PAIR // Pair of aces\njackfish.BLACKJACK\njackfish.BUST"} />
        <h2 className='center'>Computation</h2>
        <CodeBlock language='javascript' text={"jackfish.doAll(() => {\n\tjackfish.isLoaded(); // true\n\tjackfish.getEdge(); // -0.022413708758725535\n\tjackfish.takeInsurance(); // false\n\tjackfish.getBJOdds(10) // 0.07692307692307693\n\tjackfish.getBJOdds(jackfish.ACE) // 0.3076923076923077\n});"} />
        <h2 className='center'>Strategy Tables</h2>
        <CodeBlock language='javascript' text={"let table = jackfish.getTable(); // A big matrix\nlet cell = jackfish.getTable(10, 'A');\ncell.action // \"H\"\ncell.expected // 0.08160369356475769\n\njackfish.getTable(18 + jackfish.SOFT, 9).action // \"H\"\njackfish.getTable(3 + jackfish.PAIR, 5).action // \"P\""} />
      </div>
    </div>;
  }
}

export default Install;
