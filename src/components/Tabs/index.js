import React from 'react';
import './style.css';

class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: 0}
  }

  onClick(tab) {
    this.setState({
      selected: tab
    })
  }

  render() {
    return <div className='tabs'>
      <div className='tabsHead'>
        {this.props.names.map((name, i) => {
          let selected = i === this.state.selected ? 'selected' : '';
          return <button key={i} onClick={this.onClick.bind(this, i)} className={selected}>{name}</button>
        })}
      </div>
      <div className='tabsBody'>
        {this.props.renderTab(this.state.selected)}
      </div>
    </div>;
  }
}

export default Tabs;
