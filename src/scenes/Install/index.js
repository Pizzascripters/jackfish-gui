import React from 'react';
import CodeBlock from '../../components/CodeBlock';
import './style.css';

class Install extends React.Component {
  render() {
    return <div id='install'>
      <div id='install-instructions'>
        <h1 className='center'>Installation</h1><br />
        <h2 className='center'>Download the
           <a href='js/JackfishWorker.js'>worker script</a>
          and the
           <a href='js/Jackfish.js'>main script</a>
           and place them in your project directory.
        </h2>
        <h2 className='center'>Include the script in your html</h2>
        <CodeBlock language='html' text="<script type='text/javascript' src='path/to/Jackfish.js'></script>" />
      </div>
      <div id='usage'>
        <h1 className='center'>Usage</h1><br />
        <h2 className='center'>Initialization</h2>
        <CodeBlock language='javascript' text={"let params = {\n\tsoft17: false, // S17\n\tblackjack: 1.2, // 6:5\n\tsplit: {\n\t\tdouble: false // No double after split\n\t}\n};\n\nlet jackfish = new Jackfish(params);"} />
        <h2 className='center'>General Information</h2>
        <CodeBlock language='javascript' text={"jackfish.isLoaded() // true\njackfish.getEdge(); // -0.022413708758725535\njackfish.takeInsurance() // false"} />
        <h2 className='center'>Strategy Tables</h2>
        <CodeBlock language='javascript' text={"let cell = jackfish.getTable(10, 'A');\ncell.action // \"H\"\ncell.expected //0.08160369356475769"} />
      </div>
    </div>;
  }
}

export default Install;
