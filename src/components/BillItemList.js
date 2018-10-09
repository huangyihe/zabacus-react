import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { displayMediumDate } from './BillList';

const EmptyRow = ({ disp }) => (
  <tr className="clearfix">
    <td>
      <strong className="member-name">{disp}</strong>
    </td>
    <td></td>
    <td></td>
  </tr>
);

EmptyRow.propTypes = {
  disp: PropTypes.string.isRequired
};

const GET_ITEMS = gql`
query billDetail($id: ID!) {
  showBill(bid: $id) {
    id
    items {
      id
      name
      createdBy {
        id
        firstName
      }
      total
      paidBy {
        id
        firstName
      }
      assignments {
        user {
          id
          firstName
        }
        amount
      }
    }
  }
}
`;

const QueryItemList = ({ billId }) => (
  <Query query={GET_ITEMS} variables={{ id: billId }}>
    {({ loading, error, data }) => {
      if (loading) return <EmptyRow disp="Loading..." />;
      if (error) return <EmptyRow disp="Error :(" />;
      if (data.showBill.items.length === 0) return <EmptyRow disp="No items in this bill." />;
      return data.showBill.items.map(
        item => (
          <tr key={item.id} className="clearfix">
            <td>
              <strong className="member-name">{item.name}</strong>
              Created by {item.createdBy.firstName} on {displayMediumDate(item.date)}
            </td>
            <td>
              <strong className="amount">{item.total}</strong>
              Paid by {item.paidBy.firstName}
            </td>
            <td>
              <button className="btn btn-danger pull-right">Delete</button>
            </td>
          </tr>
        )
      );
    }}
  </Query>
);

QueryItemList.propTypes = {
  billId: PropTypes.string.isRequired
};

export const ItemListTab = ({ billId }) => (
  <div>
    <div className="col-md-6">
      {/* the actual item list to populate */}
      <div className="panel panel-default">
        <div className="panel-heading">Bill Items</div>
        <table className="table">
          <tbody>
            <QueryItemList billId={billId} />
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

ItemListTab.propTypes = {
  billId: PropTypes.string.isRequired
};