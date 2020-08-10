import React from 'react';
import './style.css';

class Select extends React.Component {
  constructor(props) {
    super(props);
    this.props.setChangeFunction(this.handleClick.bind(this));
    this.state = {value: props.value};
  }

  handleClick(i, skipListeners) {
    this.setState({
      value: i
    });
    this.props.onChange(i, skipListeners);
  }

  render() {
    return <div className='select'>
      {this.props.label}<br />
      {this.props.options.map((option, i) => {
        return <Button key={i} onClick={this.handleClick.bind(this, i)} isSelected={i === this.state.value} option={option}/>
      })}
    </div>;
  }
}

function Button(props) {
  return <button onMouseDown={props.onClick} className={props.isSelected ? 'selected' : ''}>
    {props.option}
  </button>;
}

export default Select;
