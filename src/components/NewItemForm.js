import React from 'react';
import PropTypes from 'prop-types';
import { MemberBlock } from './BillDetails';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { GET_ITEMS } from './BillItemList';

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
};

const modeWeighted = (mode) => {
  return mode === "weighted";
};

const filterAmountInput = (input) => {
  const filteredValue = input.replace(/[^0-9\.]/gi, '');
  const parts = filteredValue.split('.', 2);
  let textValue = parts.join(".");
  if (parts.length === 2 && parts[1].length >= 3) {
    textValue = `${parts[0]}.${parts[1].substring(0, 2)}`;
  }
  return textValue;
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ADD_ITEM = gql`
mutation addItem($bid: ID!, $name: String!, $desc: String!, $payer: ID!, $total: Float!, $wei: JSONString!) {
  addBillItem(bid: $bid, iname: $name, idesc: $desc, payer: $payer, total: $total, weights: $wei) {
    bill {
      id
    }
  }
}
`

class NewItemFormDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      total: 0.00,
      totalText: "0.00",
      name: "",
      desc: "",
      mode: "custom",
      payer: props.me,
      me: props.me,
      people: props.people,
      members: props.members,
      involved: []
    };

    this.handleItNameChange = this.handleItNameChange.bind(this);
    this.handleTotalChange = this.handleTotalChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    this.makePayer = this.makePayer.bind(this);
    this.payerReset = this.payerReset.bind(this);
    this.weightedReset = this.weightedReset.bind(this);
    this.customReset = this.customReset.bind(this);
    this.addInvolved = this.addInvolved.bind(this);
    this.removeInvolved = this.removeInvolved.bind(this);
    this.incWeight = this.incWeight.bind(this);
    this.decWeight = this.decWeight.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);

    this.generateQueryParameters = this.generateQueryParameters.bind(this);
  }

  get mode() {
    return this.state.mode;
  }

  handleItNameChange(value) {
    this.setState({ name: value });
  }
  handleTotalChange(value) {
    const textValue = filterAmountInput(value);
    const f = parseFloat(textValue);
    this.setState({
      total: f,
      totalText: textValue
    });
  }
  handleDescChange(value) {
    this.setState({ desc: value });
  }

  makePayer(user) {
    this.setState({ payer: user });
  }

  payerReset() {
    this.setState({ payer: this.state.me });
  }

  resetAll() {
    this.setState({
      total: 0.00,
      totalText: "0.00",
      name: "",
      desc: "",
      mode: "custom",
      payer: this.props.me,
      members: this.props.members,
      involved: []
    });
  }
  
  get getTotal() {
    return this.state.totalText;
  }

  weightedReset() {
    const newInvolved = this.state.involved.map(user => {
      user.weight = 1;
      const amt = this.state.total / this.state.involved.length;
      user.amount = parseFloat(amt.toFixed(2));
      user.amountText = `${user.amount}`;
      return user;
    });

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
    if (amt > 0 || (amt < 0 && newInvolved[i].weight >= 2)) {
      newInvolved[i].weight += amt;
    }

    var totalWeight = 0;
    // recalculate amounts
    newInvolved.map(member => {
      totalWeight += member.weight;
      return null;
    });
    newInvolved.map(member => {
      const mamt = (member.weight / totalWeight) * this.state.total;
      member.amount = parseFloat(mamt.toFixed(2));
      member.amountText = `${member.amount}`;
      return null;
    });

    this.setState({ involved: newInvolved });
  }

  incWeight(user) {
    this.changeWeight(user, 1);
  }
  decWeight(user) {
    this.changeWeight(user, -1);
  }

  handleAmountChange(user, input) {
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

    const newAmount = filterAmountInput(input);
    newInvolved[i].amount = parseFloat(newAmount);
    newInvolved[i].amountText = newAmount;

    var newTotal = 0;
    for (i = 0; i < newInvolved.length; i++) {
      newTotal += newInvolved[i].amount;
    }

    this.setState({
      total: parseFloat(newTotal.toFixed(2)),
      totalText: newTotal.toFixed(2),
      involved: newInvolved
    });
  }

  generateQueryParameters() {
    // basic validation
    if (this.state.involved.length === 0 || this.state.total === 0) {
      return null;
    }
    if (this.state.name === "" || this.state.desc === "") {
      return null;
    }

    var assignments = {};
    if (modeCustom(this.state.mode)) {
      this.state.involved.map(member => {
        assignments[member.username] = member.amount;
        return null;
      });
    } else {
      var totalWeight = 0;
      this.state.involved.map(member => {
        totalWeight += member.weight;
        return null;
      });
      var roundedTotal = 0;
      this.state.involved.map(member => {
        const amt = (member.weight / totalWeight) * this.state.total;
        const roundedAmt = parseFloat(amt.toFixed(2));
        roundedTotal += roundedAmt;
        assignments[member.username] = roundedAmt;
        return null;
      });
      const error = roundedTotal - this.state.total;
      if (error !== 0) {
        const idx = randomInt(0, this.state.involved.length - 1);
        assignments[this.state.involved[idx].username] -= error;
      }
    }

    const params = {
      bid: this.props.billId,
      name: this.state.name,
      desc: this.state.desc,
      payer: this.state.payer.id,
      total: this.state.total,
      wei: JSON.stringify(assignments)
    }

    console.log(params);
    return params;
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
        <FormPayerSelector payer={this.state.payer} people={this.state.people}
          makePayer={this.makePayer} payerReset={this.payerReset} />
        <FormMemberList
          involved={this.state.involved} members={this.state.members}
          addInvolved={this.addInvolved} removeInvolved={this.removeInvolved}
          incWeight={this.incWeight} decWeight={this.decWeight}
          mode={this.mode} amountChange={this.handleAmountChange}
          weightedReset={this.weightedReset}
        />
        <div className="row-fluid clearfix in-form-margin">
          <div className="col-md-12">
            <Mutation mutation={ADD_ITEM}
              refetchQueries={({ loading, error, data }) => {
                if (loading || error) {
                  return [];
                }
                if (data.addBillItem == null) return [];
                return [{
                  query: GET_ITEMS,
                  variables: { id: this.props.billId }
                }];
              }} >
              {(addItem, { loading, error, data }) => {
                var errorTag = null;
                var buttonDisabled = false;

                if (loading) {
                  buttonDisabled = true;
                }
                if (error) {
                  errorTag = <span>Query error :(</span>;
                }

                return (
                  <div>
                    <button className="btn btn-primary btn-lg pull-right"
                      disabled={buttonDisabled}
                      onClick={e => {
                        const params = this.generateQueryParameters();
                        if (params != null) {
                          addItem({ variables: params });
                        } else {
                          console.log("form not complete, query not generated");
                        }
                      }}>
                      Create Item
                    </button>
                    {errorTag}
                  </div>
                );
              }}
            </Mutation>
          </div>
        </div>
      </div>
    );
  }
}

NewItemFormDisplay.propTypes = {
  people:  PropTypes.array.isRequired,
  members: PropTypes.array.isRequired,
  billId:  PropTypes.string.isRequired,
  me:      PropTypes.object.isRequired
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
  getTotal:    PropTypes.string.isRequired
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

/* fourth row: payer selector */
const FormPayerSelector = ({ payer, people, makePayer, payerReset }) => {
  const payerBlock = (
    <li key={payer.id} className="list-group-item clearfix">
      <MemberBlock member={payer} />
      <span className="pull-right owner-marker">
        Payer
      </span>
    </li>
  );

  const availList = people.map(user => (
    <li key={user.id} onClick={e => makePayer(user)}>
      <a>{`${user.firstName} ${user.lastName}`}</a>
    </li>
  ));

  return (
    <div className="row-fluid clearfix">
      <div className="col-md-12">
        <ul className="list-group clearfix">
          {payerBlock}
          <li className="list-group-item clearfix">
            <div className="btn-group pull-left">
              <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                Select payer <span className="caret"></span>
              </button>
              <ul className="dropdown-menu">
                {availList}
              </ul>
            </div>
            <button className="btn btn-success pull-right"
              onClick={e => payerReset()} >
              Reset to me!
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

FormPayerSelector.propTypes = {
  payer:      PropTypes.object.isRequired,
  people:     PropTypes.array.isRequired,
  makePayer:  PropTypes.func.isRequired,
  payerReset: PropTypes.func.isRequired
};

/* fifth row: list group of members and their obligations */
const FormMemberList = ({ involved, members, addInvolved, removeInvolved,
                          mode, weightedReset, amountChange, decWeight, incWeight }) => {
  const activeList = involved.map(user => {
    let insert;
    if (modeCustom(mode)) {
      insert = (
        <div className="input-group input-group-sm debt-weight pull-right">
          <span className="input-group-addon">$</span>
          <input type="text" className="form-control" placeholder="Amount" value={user.amountText}
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
          <input type="text" className="form-control" disabled="disabled" value={`${user.weight}`} />
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

const GET_MEMBERS_ME = gql`
query getMembers($id: ID!) {
  showBill(bid: $id) {
    id
    createdBy {
      id
    }
    people {
      id
      username
      email
      firstName
      lastName
    }
  }
  me {
    id
    username
    email
    firstName
    lastName
  }
}
`;

export const NewItemForm = ({ billId }) => (
  <Query query={GET_MEMBERS_ME} variables={{ id: billId }}>
  {({ loading, error, data }) => {
    if (loading) return <EmptyPage disp="Loading" />;
    if (error) return <EmptyPage disp="ERROR :(" />;
    if (data.showBill == null || data.showBill.people == null) {
      return <EmptyPage disp="Unknown error :(" />;
    }
    if (data.me == null) {
      return <EmptyPage disp="Unknown error (me) :(" />;
    }
    const members = data.showBill.people.map(user => {
      user.weight = 1;
      user.amount = 0.00;
      user.amountText = "0.00";
      return user;
    });
    return <NewItemFormDisplay billId={billId} members={members}
      people={data.showBill.people} me={data.me} />;
  }}
  </Query>
);

NewItemForm.propTypes = {
  billId: PropTypes.string.isRequired
};