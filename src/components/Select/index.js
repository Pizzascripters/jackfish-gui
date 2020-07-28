import React from 'react';
import './style.css';

class Select extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: 0};
  }

  handleClick(i) {
    this.setState({
      value: i
    });
    this.props.onChange(i);
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
