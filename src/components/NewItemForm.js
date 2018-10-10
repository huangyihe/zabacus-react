import React from 'react';
import PropTypes from 'prop-types';
import avatarLink from './BillDetails';

class NewItemFormDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      total: 0.0,
      name: "",
      desc: "",
      mode: "custom",
      members: props.people,
      involved: []
    };

    this.modeWeighted = this.modeWeighted.bind(this);
    this.modeCustom = this.modeCustom.bind(this);
    this.handleItNameChange = this.handleItNameChange.bind(this);
    this.handleTotalChange = this.handleTotalChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    this.getTotal = this.getTotal.bind(this);
    this.weightedReset = this.weightedReset.bind(this);
    this.customReset = this.customReset.bind(this);
    this.addInvolved = this.addInvolved.bind(this);
    this.removeInvolved = this.removeInvolved.bind(this);
    this.incWeight = this.incWeight.bind(this);
    this.decWeight = this.decWeight.bind(this);
  }

  modeWeighted() {
    return this.state.mode === "weighted";
  }
  modeCustom() {
    return this.state.mode === "custom";
  }

  handleItNameChange(value) {
    this.setState({ name: value });
  }
  handleTotalChange(value) {
    this.setState({ total: parseFloat(value) });
  }
  handleDescChange(value) {
    this.setState({ desc: value });
  }
  getTotal() {
    return this.state.total;
  }

  weightedReset() {
    const newInvolved = this.state.involved.map(user => {
      user.weight = 1;
      return
    });
    this.setState({
      mode: "weighted",
      involved: newInvolved
    });
  }
  customReset() {
    this.setState({ mode: "custom" });
  }

  addInvolved(user) {}
  removeInvolved(user) {}

  incWeight(user) {}
  decWeight(user) {}

  render() {
    return (
      <div>
        <FormHeader
          modeCustom={this.modeCustom} nameChange={this.handleItNameChange}
          totalChange={this.handleTotalChange} getTotal={this.getTotal}
        />
        <FormDescBox descChange={this.handleDescChange} />
        <FormModeSel weightedReset={this.weightedReset} customReset={this.customReset} />
        <FormMemberList
          involved={this.state.involved} members={this.state.members}
          addInvolved={this.addInvolved} removeInvolved={this.removeInvolved}
          incWeight={this.incWeight} decWeight={this.decWeight}
          modeCustom={this.modeCustom}
        />
        <div className="row-fluid clearfix in-form-margin">
          <div className="col-md-12">
            <button className="btn btn-primary btn-lg pull-right">
              Create Item
            </button>
          </div>
        </div>
      </div>
    );
  }
}

NewItemFormDisplay.propTypes = {
  people: PropTypes.array.isRequired
};

/* first row: item name and total */
const FormHeader = ({ modeCustom, nameChange, totalChange, getTotal }) => (
  <div className="row-fluid clearfix in-form-margin first-row">
    <div className="col-xs-8 col-sm-9 col-md-8">
      <input type="text" className="form-control" placeholder="New Item Name"
        onChange={e =>  nameChange(e.target.value)} />
    </div>
    <div className="col-xs-4 col-sm-3 col-md-4">
      <div className="input-group">
        <span className="input-group-addon">$</span>
        <input type="text" className="form-control"
          disabled={modeCustom()} value={getTotal()} onChange={e => totalChange(e.target.value)} />
      </div>
    </div>
  </div>
);

FormHeader.propTypes = {
  disabledOn:  PropTypes.func.isRequired,
  nameChange:  PropTypes.func.isRequired,
  totalChange: PropTypes.func.isRequired,
  getTotal:    PropTypes.func.isRequired
};

/* second row: description box */
const FormDescBox = ({ descChange }) => (
  <div className="row-fluid clearfix in-form-margin">
    <div className="col-md-12">
      <textarea className="form-control" rows="4" placeholder="Describe it more"
        onChange={e => descChange(e.target.value)} >
      </textarea>
    </div>
  </div>
);

FormDescBox.propTypes = {
  descChange: PropTypes.func.isRequired
};

/* third row: mode selector */
const FormModeSel = ({ weightedReset, customReset }) => (
  <div className="row-fluid clearfix in-form-margin">
    <div className="col-xs-6">
      <div className="input-group">
        <span className="input-group-addon">
          <input type="radio" value="weighted" checked="checked"
            OnClick={e => weightedReset()} />
        </span>
        <input type="text" className="form-control" disabled="disabled" value="Weighted" />
      </div>
    </div>
    <div className="col-xs-6">
      <div className="input-group">
        <span className="input-group-addon">
          <input type="radio" value="custom"
            onClick={e => customReset()} />
        </span>
        <input type="text" className="form-control" disabled="disabled" value="Custom" />
      </div>
    </div>
  </div>
);

FormModeSel.propTypes = {
  weightedReset: PropTypes.func.isRequired,
  customReset: PropTypes.func.isRequired
};

/* fourth row: list group of members and their obligations */
const FormMemberList = ({ involved, members, addInvolved, removeInvolved,
                          modeCustom, decWeight, incWeight }) => {
  const activeList = involved.map(user => {
    let insert;
    if (modeCustom()) {
      insert = (
        <div className="input-group input-group-sm debt-weight pull-right">
          <span className="input-group-addon">$</span>
          <input type="text" className="form-control" placeholder="Amount" />
          <span className="input-group-btn">
            <button type="button" className="btn btn-danger" onClick={removeInvolved(user)}>
              <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
            </button>
          </span>
        </div>
      );
    } else {
      insert = (
        <div className="input-group input-group-sm debt-weight pull-right">
          <span className="input-group-addon">Weight</span>
          <input type="text" className="form-control" disabled="disabled" value={user.weight} />
          <div className="input-group-btn">
            <button type="button" className="btn btn-default" onClick={incWeight(user)}>
              <span className="caret caret-reversed"></span>
            </button>
            <button type="button" className="btn btn-default" ng-click={decWeight(user)}>
              <span className="caret"></span>
            </button>
            <button type="button" className="btn btn-danger" onClick={removeInvolved(user)}>
              <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <li className="list-group-item clearfix">
        <span className="member-link pull-left">
          <img className="avatar" alt="alt" height="40" width="40" src={avatarLink(user.email)} />
          <div className="member-info">
            <strong className="member-name">{user.name}</strong>
            {user.username}
          </div>
        </span>
        {insert}
      </li>
    );
  });

  const availList = members.map(user => {
    <li onClick={addInvolved(user)}>
      <span>{user.name}</span>
    </li>
  });

  return (
    <div className="row-fluid clearfix">
      <div className="col-md-12">
        <ul className="list-group clearfix">
          {activeList}
          <li className="list-group-item clearfix">
            <div className="btn-group pull-left">
              <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                Add a member <span className="caret"></span>
              </button>
              <ul className="dropdown-menu">
                {availList}
              </ul>
            </div>
            <button className="btn btn-success pull-right"
              onClick={weightedReset()} disabled={modeCustom()}>
              Even up!
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

FormMemberList.propTypes = {
  involved:       PropTypes.array.isRequired,
  members:        PropTypes.array.isRequired,
  addInvolved:    PropTypes.func.isRequired,
  removeInvolved: PropTypes.func.isRequired,
  modeCustom:     PropTypes.func.isRequired,
  incWeight:      PropTypes.func.isRequired,
  decWeight:      PropTypes.func.isRequired
};