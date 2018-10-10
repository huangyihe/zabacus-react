import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { avatarLink } from './BillDetails';

const binarySearch = (sortedArray, target, compare) => {
  var left = 0;
  var right = sortedArray.length - 1;

  while (left <= right) {
    const mid = left + ((right - left) >> 1);
    const cmp = compare(sortedArray[mid], target);
    if (cmp === 0) {
      return mid;
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

const findAndUpdate = (array, target, amount) => {
  const cmp = (a, b) => {
    if (a.userId < b.userId) return -1;
    else if (a.userId > b.userId) return 1;
    else return 0;
  };
  const idx = binarySearch(array, target, cmp);
  if (idx === -1) return -1;
  array[idx].amount += amount;
  return 0;
};

const computeSettlement = (members, items) => {
  // first make sure all people are sorted by user id
  members.sort((a, b) => {
    if (a.id > b.id) { return 1; }
    else if (a.id < b.id) { return -1; }
    else { return 0; }
  });

  // initialize debt graph
  const idKey = (id) => ("id=" + id);
  var fullDebtGraph = {};
  var perUserDebt = [];

  for (var i = 0; i < members.length; i++) {
    const u = members[i];
    perUserDebt.push({
      userId: u.id,
      amount: 0
    });
    fullDebtGraph[idKey(u.id)] = {};
  }

  for (i = 0; i < members.length; i++) {
    for (var j = 0; j < members.length; j++) {
      const thisId = members[i].id;
      const otherId = members[j].id;
      if (otherId !== thisId) {
        fullDebtGraph[idKey(thisId)][idKey(otherId)] = 0;
        fullDebtGraph[idKey(otherId)][idKey(thisId)] = 0;
      }
    }
  }

  items.map(item => {
    const payerId = item.paidBy.id;
    item.assignments.map(ass => {
      const id = ass.user.id;
      const amt = ass.amount;
      if (payerId !== id) {
        var r = findAndUpdate(perUserDebt, { userId: payerId }, -amt);
        if (r !== 0) {
          console.error(`invariant1, ${payerId}`);
        }
        r = findAndUpdate(perUserDebt, { userId: id }, amt);
        if (r !== 0) {
          console.error(`invariant2, ${id}`);
        }

        fullDebtGraph[idKey(payerId)][idKey(id)] -= amt;
        fullDebtGraph[idKey(id)][idKey(payerId)] += amt;
      }
      return null;
    });
    return null;
  });

  perUserDebt.sort((a, b) => {
    if (a.amount < b.amount) return -1;
    else if (a.amount > b.amount) return 1;
    else return 0;
  });

  // sanity check
  var sum = 0;
  perUserDebt.map(debt => {
    sum += debt.amount;
    return null;
  });
  if (sum !== 0) {
    console.error("database invariant violated");
    console.log(perUserDebt);
  }

  // resolve circular payments
  var left = 0;
  var right = perUserDebt.length > 0 ? perUserDebt.length - 1 : 0;

  var settlement = {};
  while (left !== right) {
    let maxOwed = perUserDebt[left];
    let maxBorrow = perUserDebt[right];
    if (((left + 1) === right) && ((maxOwed.amount + maxBorrow.amount) !== 0)) {
      console.error("invariant!!!");
    }
    if (maxOwed.amount + maxBorrow.amount > 0) {
      settlement[`${maxOwed.userId},${maxBorrow.userId}`] = maxOwed.amount;
      maxBorrow.amount += maxOwed.amount;
      left += 1;
    } else {
      settlement[`${maxOwed.userId},${maxBorrow.userId}`] = -maxBorrow.amount;
      maxOwed.amount += maxBorrow.amount;
      right -= 1;
    }
  }
  console.log(settlement);
  return settlement;
};

/*

settlement object:

{
"`id1,id2`": amount ===> it means id1 should pay id2 $amount
}

negative amount means id1 is owed, otherwise id2 is owed

all amounts here should be <= 0

*/

const getPerspective = (settlement, meId) => {
  var mySettlement = {
    owed: [],
    owing: []
  };
  for (var key in settlement) {
    const ids = key.split(',');
    const amt = settlement[key];
    if (amt !== 0) {
      if (ids[0] === meId) {
        mySettlement.owed.push({
          other: ids[1],
          amount: amt
        });
      } else if (ids[1] === meId) {
        mySettlement.owing.push({
          other: ids[0],
          amount: -amt
        });
      }
    }
  }
  return mySettlement;
};

const displayName = (user) => `${user.firstName} ${user.lastName}`;
const displayUname = (user) => `${user.email} (${user.username})`;
const findById = (people, id) => {
  for (var i = 0; i < people.length; i++) {
    if (people[i].id === id) {
      return people[i];
    }
  }
  return null;
}

const PaymentList = ({ people, payments }) => payments.map(payment => {
  const user = findById(people, payment.other);
  const amountClass = payment.amount <= 0 ? "surplus" : "deficit";
  const name = displayName(user);
  const usernameEmail = displayUname(user);
  const imgLink = avatarLink(user.email);

  return (
    <li key={amountClass + user.id} className="list-group-item clearfix">
      <span className="member-link pull-left">
        <img className="avatar" alt="avatar" height="40" width="40" src={imgLink} />
        <div className="member-info">
          <strong className="member-name">{name}</strong>
          {usernameEmail}
        </div>
      </span>
      <span className={"pull-right " + amountClass}>
        {payment.amount}
      </span>
    </li>
  );
});

const SettlementLists = ({ people, settlement }) => (
  <div className="row">
    <div className="col-md-6">
      <div className="panel panel-success">
        <div className="panel-heading">I am owed</div>
        <ul className="list-group">
          <PaymentList people={people} payments={settlement.owed} />
        </ul>
      </div>
    </div>
    <div className="col-md-6">
      <div className="panel panel-danger">
        <div className="panel-heading">I owe</div>
        <ul className="list-group">
          <PaymentList people={people} payments={settlement.owing} />
        </ul>
      </div>
    </div>
  </div>
);

const DisplaySettlementTab = ({ people, settlement }) => (
  <div className="row-fluid">
    <SettlementLists people={people} settlement={settlement} />
    <div className="row">
      <div className="col-xs-12">
        <p className="text-mute">The current resolution mode is: default
        <span className="glyphicon glyphicon-question-sign"></span></p>
      </div>
    </div>
  </div>
);

const GET_BILL_ME = gql`
query getAll($id: ID!) {
  showBill(bid: $id) {
    id
    people {
      id
      username
      firstName
      lastName
      email
    }
    items {
      id
      paidBy {
        id
      }
      assignments {
        user {
          id
        }
        amount
      }
    }
  }
  me {
    id
  }
}
`;

const BlankTab = ({ disp }) => (
  <div className="row-fluid">
    <div className="col-xs-12">
    {disp}
    </div>
  </div>
);

export class SettlementTab extends React.Component {
  render() {
    return (
      <Query query={GET_BILL_ME} variables={{ id: this.props.billId }}>
        {({ loading, error, data }) => {
          if (loading) return <BlankTab disp="Loading..." />;
          if (error) return <BlankTab disp="Error :(" />;
          if (data.showBill != null && data.me != null) {
            const people = data.showBill.people;
            const fullSettlement = computeSettlement(people, data.showBill.items);
            const mySettlement = getPerspective(fullSettlement, data.me.id);
            return <DisplaySettlementTab people={people} settlement={mySettlement} />;
          }
          return <BlankTab disp="Unknown error :(" />;
        }}
      </Query>
    );
  }
}

SettlementTab.propTypes = {
  billId: PropTypes.string.isRequired
};