import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link, Redirect } from 'react-router-dom';
import { hasToken } from './UIRoot';
import { ItemListTab } from './BillItemList';
import { BillDetailsTab } from './BillDetails';
import { SettlementTab } from './Settlement';

const PathIndicator = (props) => (
  <div className="row">
    <ol className="breadcrumb">
      <li><Link to="/bills/list">All Bills</Link></li>
      <li className="active">{props.name}</li>
    </ol>
  </div>
);

PathIndicator.propTypes = {
  name: PropTypes.string.isRequired
};

const BillTitleBar = (props) => (
  <div className="row vertical-align">
    <div className="col-sm-10">
      <h1>{props.name}</h1>
    </div><div className="col-sm-2">
      <button
        className="btn btn-primary btn-lg pull-right"
        onClick={e => {props.activateTab('items');}}>Add Item!</button>
    </div>
  </div>
);

BillTitleBar.propTypes = {
  name: PropTypes.string.isRequired,
  activateTab: PropTypes.func.isRequired
};

const activeOn = (tabName, compare) => {
  return (tabName === compare) ? 'active' : '';
};

const BillNavBar = (props) => (
  <div className="row">
    <ul className="nav nav-tabs">
      <li role="presentation" className={activeOn(props.tabName, "details")}
        onClick={e => {props.activateTab('details')}}><a>Details</a></li>
      <li role="presentation" className={activeOn(props.tabName, "items")}
        onClick={e => {props.activateTab('items')}}><a>Items</a></li>
      <li role="presentation" className={activeOn(props.tabName, "settlement")}
        onClick={e => {props.activateTab('settlement')}}><a>Settlement</a></li>
    </ul>
  </div>
);

BillNavBar.propTypes = {
  tabName: PropTypes.string.isRequired,
  activateTab: PropTypes.func.isRequired
};

const GET_BILL = gql`
query billDetail($id: ID!) {
  showBill(bid: $id) {
    id
    name
  }
}
`;

export class BillView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTabName: 'details'
    }
    this.activateTab = this.activateTab.bind(this);
  }

  get tabName() {
    return this.state.activeTabName;
  }

  activateTab(newTab) {
    this.setState({ activeTabName: newTab });
  }

  render() {
    if (!hasToken()) return <Redirect to="/" />;
  
    const billId = this.props.match.params.billId;
    let viewToShow;
    if (this.state.activeTabName === 'details') {
      viewToShow = <BillDetailsTab billId={billId} />
    } else if (this.state.activeTabName === 'items') {
      viewToShow = <ItemListTab billId={billId} />;
    } else {
      viewToShow = <SettlementTab billId={billId} />;
    }

    return (
      <Query query={GET_BILL} variables={{ id: billId }}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;
          const name = data.showBill.name;
          return (
            <div className="container container-body">
              <PathIndicator name={name} />
              <BillTitleBar name={name} activateTab={this.activateTab} />
              <BillNavBar tabName={this.tabName} activateTab={this.activateTab} />
              {viewToShow}
            </div>
          );
        }}
      </Query>
    );
  }
}