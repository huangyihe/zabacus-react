import React from 'react';
import PropTypes from 'prop-types';
import { MemberBlock, GET_MEMBERS } from './BillDetails';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

const moveFromAToB = (t, A, B) => {
  var newA = A.slice(0);
  var i = 0;
  for (; i < newA.length; i++) {
    if (newA[i].id === t.id) {
      break;
    }
  }
  if (i === newA.length) {
    console.exception("unable to find target in \"from\" list");
    return null;
  }

  const found = newA.splice(i, 1);
  if (found.length !== 1) {
    console.exception("invariant mismatch: must have removed only one item");
    return null;
  }
  var newB = B.slice(0);
  newB.push(found[0]);

  return {
    A: newA,
    B: newB
  };
}

const modeCustom = (mode) => {
  return mode === "custom";
}

const modeWeighted = (mode) => {
  return mode === "weighted";
}

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

    //this.modeWeighted = this.modeWeighted.bind(this);
    //this.modeCustom = this.modeCustom.bind(this);
    this.handleItNameChange = this.handleItNameChange.bind(this);
    this.handleTotalChange = this.handleTotalChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    //this.getTotal = this.getTotal.bind(this);
    this.weightedReset = this.weightedReset.bind(this);
    this.customReset = this.customReset.bind(this);
    this.addInvolved = this.addInvolved.bind(this);
    this.removeInvolved = this.removeInvolved.bind(this);
    this.incWeight = this.incWeight.bind(this);
    this.decWeight = this.decWeight.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
  }

  get mode() {
    return this.state.mode;
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
  
  get getTotal() {
    return this.state.total;
  }

  weightedReset() {
    const newInvolved = this.state.involved.map(user => {
      user.weight = 1;
      return user;
    });
    console.log("weighted reset");
    this.setState({
      mode: "weighted",
      involved: newInvolved
    });
  }
  customReset() {
    this.setState({ mode: "custom" });
  }

  addInvolved(user) {
    const afterMove = moveFromAToB(user, this.state.members, this.state.involved);
    this.setState({
      members: afterMove.A,
      involved: afterMove.B
    });
  }
  removeInvolved(user) {
    const afterMove = moveFromAToB(user, this.state.involved, this.state.members);
    this.setState({
      involved: afterMove.A,
      members: afterMove.B
    });
  }

  changeWeight(user, amt) {
    var newInvolved = this.state.involved.slice(0);
    var i = 0;
    for (; i < newInvolved.length; i++) {
      if (newInvolved[i].id === user.id) {
        break;
      }
    }
    if (i === newInvolved.length) {
      console.exception("User not found in involved list!!");
      return;
    }
    newInvolved[i].weight += amt;
    this.setState({ involved: newInvolved });
  }

  incWeight(user) {
    this.changeWeight(user, 1);
  }
  decWeight(user) {
    this.changeWeight(user, -1);
  }

  handleAmountChange(user, newAmount) {
    var newInvolved = this.state.involved.slice(0);
    var i = 0;
    for (; i < newInvolved.length; i++) {
      if (newInvolved[i].id === user.id) {
        break;
      }
    }
    if (i === newInvolved.length) {
      console.exception("User not found in involved list (amount)");
      return;
    }
    newInvolved[i].amount = newAmount;
    this.setState({ involved: newInvolved });
  }

  render() {
    return (
      <div className ="col-md-6">
        <FormHeader mode={this.mode} nameChange={this.handleItNameChange}
          totalChange={this.handleTotalChange} getTotal={this.getTotal}
        />
        <FormDescBox descChange={this.handleDescChange} />
        <FormModeSel
          weightedReset={this.weightedReset} customReset={this.customReset}
          mode={this.mode}
        />
        <FormMemberList
          involved={this.state.involved} members={this.state.members}
          addInvolved={this.addInvolved} removeInvolved={this.removeInvolved}
          incWeight={this.incWeight} decWeight={this.decWeight}
          mode={this.mode} amountChange={this.handleAmountChange}
          weightedReset={this.weightedReset}
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
const FormHeader = ({ mode, nameChange, totalChange, getTotal }) => (
  <div className="row-fluid clearfix in-form-margin first-row">
    <div className="col-xs-8 col-sm-9 col-md-8">
      <input type="text" className="form-control" placeholder="New Item Name"
        onChange={e =>  nameChange(e.target.value)} />
    </div>
    <div className="col-xs-4 col-sm-3 col-md-4">
      <div className="input-group">
        <span className="input-group-addon">$</span>
        <input type="text" className="form-control"
          disabled={modeCustom(mode)} value={getTotal} onChange={e => totalChange(e.target.value)} />
      </div>
    </div>
  </div>
);

FormHeader.propTypes = {
  mode:        PropTypes.string.isRequired,
  nameChange:  PropTypes.func.isRequired,
  totalChange: PropTypes.func.isRequired,
  getTotal:    PropTypes.number.isRequired
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
const FormModeSel = ({ weightedReset, customReset, mode }) => {
  const changeHandler = e => {
    if (e.currentTarget.value === "weighted") {
      console.log("mode changed to weighted");
      weightedReset();
    } else {
      customReset();
    }
  };
  return (
    <div className="row-fluid clearfix in-form-margin">
      <div className="col-xs-6">
        <div className="input-group">
          <span className="input-group-addon">
            <input type="radio" value="weighted" checked={modeWeighted(mode)}
              onChange={changeHandler} />
          </span>
          <input type="text" className="form-control" disabled="disabled" value="Weighted" />
        </div>
      </div>
      <div className="col-xs-6">
        <div className="input-group">
          <span className="input-group-addon">
            <input type="radio" value="custom" checked={modeCustom(mode)}
              onChange={changeHandler} />
          </span>
          <input type="text" className="form-control" disabled="disabled" value="Custom" />
        </div>
      </div>
    </div>
  );
};

FormModeSel.propTypes = {
  weightedReset: PropTypes.func.isRequired,
  customReset:   PropTypes.func.isRequired,
  mode:          PropTypes.string.isRequired
};

/* fourth row: list group of members and their obligations */
const FormMemberList = ({ involved, members, addInvolved, removeInvolved,
                          mode, weightedReset, amountChange, decWeight, incWeight }) => {
  const activeList = involved.map(user => {
    let insert;
    if (modeCustom(mode)) {
      insert = (
        <div className="input-group input-group-sm debt-weight pull-right">
          <span className="input-group-addon">$</span>
          <input type="text" className="form-control" placeholder="Amount" value={user.amount}
            onChange={e => amountChange(user, e.target.value)} />
          <span className="input-group-btn">
            <button type="button" className="btn btn-danger"
              onClick={e => removeInvolved(user)}>
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
            <button type="button" className="btn btn-default"
              onClick={e => {incWeight(user);}}>
              <span className="caret caret-reversed"></span>
            </button>
            <button type="button" className="btn btn-default"
              onClick={e => {decWeight(user)}}>
              <span className="caret"></span>
            </button>
            <button type="button" className="btn btn-danger"
              onClick={e => {removeInvolved(user)}}>
              <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <li key={user.id} className="list-group-item clearfix">
        <MemberBlock member={user} />
        {insert}
      </li>
    );
  });

  const availList = members.map(user => (
    <li key={user.id} onClick={e => {addInvolved(user);}}>
      <a>{`${user.firstName} ${user.lastName}`}</a>
    </li>
  ));

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
              onClick={e => {weightedReset();}} disabled={modeCustom(mode)}>
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
  mode:           PropTypes.string.isRequired,
  weightedReset:  PropTypes.func.isRequired,
  amountChange:   PropTypes.func.isRequired,
  incWeight:      PropTypes.func.isRequired,
  decWeight:      PropTypes.func.isRequired
};

const EmptyPage = ({ disp }) => (
  <div className="row-fluid clearfix in-form-margin first-row">
    {disp}
  </div>
);

EmptyPage.propTypes = {
  disp: PropTypes.string.isRequired
};

export const NewItemForm = ({ billId }) => (
  <Query query={GET_MEMBERS} variables={{ id: billId }}>
  {({ loading, error, data }) => {
    if (loading) return <EmptyPage disp="Loading" />;
    if (error) return <EmptyPage disp="ERROR :(" />;
    if (data.showBill == null || data.showBill.people == null) {
      return <EmptyPage disp="Unknown error :(" />;
    }
    const members = data.showBill.people.map(user => {
      user.weight = 1;
      user.amount = 0;
      return user;
    });
    return <NewItemFormDisplay people={members} />;
  }}
  </Query>
);

NewItemForm.propTypes = {
  billId: PropTypes.string.isRequired
};