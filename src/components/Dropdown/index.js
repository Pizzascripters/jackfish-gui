import React from 'react';
import './style.css';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: props.selected, open: false};
    this.self = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('click', onClick.bind(this));

    function onClick(e) {
      if(this.self.current === null) {
        window.removeEventListener('click', onClick);
      } else if(!this.self.current.contains(e.target)) {
        this.setState({
          open: false
        });
      }
    }
  }

  dropdown(e) {
    if(e.target.className === 'option') {
      this.setState({
        open: false,
        selected: e.target.innerHTML
      });
      if(this.props.onSelect) {
        this.props.onSelect(e.target.innerHTML);
      }
    } else {
      this.setState({
        open: !this.state.open
      });
    }
  }

  render() {
    return <div ref={this.self} onClick={this.dropdown.bind(this)} className='dropdown'>
      <div className='dropdownText'> {this.state.selected} <span className='tiny'>&#9660;</span></div>
      <div className={'options' + (this.state.open ? '' : ' hidden')}>
        {this.props.options.map((option, i) => {
          return <div key={i} className='option'>{option}</div>;
        })}
      </div>
    </div>;
  }
}

export default Dropdown;
