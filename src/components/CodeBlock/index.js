import React from 'react';
import './style.css';

class CodeBlock extends React.Component {
  componentDidMount() {
    document.querySelectorAll('pre code').forEach((block) => {
      window.hljs.highlightBlock(block);
    });
  }

  render() {
    return <pre className='codeblock'><code className={this.props.language}>
      {this.props.text}
    </code></pre>;
  }
}

export default CodeBlock;
