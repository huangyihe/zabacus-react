import React from 'react';

export class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disp: "",
      val: 0,
      ans: 0
    };

    this.dispEmpty = this.dispEmpty.bind(this);
    this.numPress = this.numPress.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.appendAns = this.appendAns.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.backspace = this.backspace.bind(this);
  }

  /* Calculator controls */
  dispEmpty() {
    return (this.state.disp === "");
  }
  numPress (char) {
    this.state.disp += char;
  }
  backspace() {
    if (this.state.disp.length > 0) {
      this.setState({
        disp: this.state.disp.substring(0, this.state.disp.length - 1)
      });
    }
  }
  evaluate() {
    const result = eval(this.state.disp);
    this.setState({
      ans: result,
      disp: String(result)
    });
  };
  appendAns() {
    if (this.dispEmpty() || !this.isNumber(this.state.disp[this.state.disp.length - 1])) {
      this.setState({
        disp: String(this.state.ans)
      });
    }
  };
  clearAll() {
    this.setState({ disp: "" });
  }
  isNumber(char) {
    return (char >= '0' && char <= '9');
  };

  buttonClass(type) {
    var cssClass = `btn btn-${type} btn-lg calc`;
    if (this.dispEmpty()) {
      cssClass += " disabled";
    }
    return cssClass;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12"><h3>Calculator? Right here!</h3></div>
        </div>
        <div className="row calc">
          <div className="col-xs-12">
            <input type="text" className="form-control calc" disabled={true} />
          </div>
        </div>{/* display */}
        <div className="row calc">
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('7')}>7</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('8')}>8</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('9')}>9</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("warning")} onClick={this.backspace()}>DEL</button></div>
          <div className="col-xs-3"><button className="btn btn-warning btn-lg calc" onClick={this.clearAll()}>AC</button></div>
        </div>{/* 789 del ac */}
        <div className="row calc">
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('4')}>4</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('5')}>5</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('6')}>6</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("default")} onClick={this.numPress('*')}>*</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("default")} onClick={this.numPress('/')}>/</button></div>
        </div>{/* 456 * / */}
        <div className="row calc">
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('1')}>1</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('2')}>2</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('3')}>3</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("default")} onClick={this.numPress('+')}>+</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("default")} onClick={this.numPress('-')}>-</button></div>
        </div>{/* 123 + - */}
        <div className="row calc">
          <div className="col-xs-4"><button className="btn btn-default btn-lg calc" onClick={this.numPress('0')}>0</button></div>
          <div className="col-xs-2"><button className="btn btn-default btn-lg calc" onClick={this.numPress('.')}>.</button></div>
          <div className="col-xs-3"><button className="btn btn-default btn-lg calc" onClick={this.appendAns()}>Ans</button></div>
          <div className="col-xs-3"><button className={this.buttonClass("primary")} onClick={this.evaluate()}>=</button></div>
        </div>{/* 0(big) . ans = */}
      </div>
    );
  }
}