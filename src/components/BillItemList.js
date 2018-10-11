import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { currencyFormat, displayMediumDate } from '../utils/format';

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

export const GET_ITEMS = gql`
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

const DELETE_ITEM = gql`
mutation deleteItem($id: ID!) {
  deleteBillItem(iid: $id) {
    bill {
      id
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
              <strong className="amount">{currencyFormat("$", item.total)}</strong>
              Paid by {item.paidBy.firstName}
            </td>
            <td>
              <Mutation mutation={DELETE_ITEM}
                refetchQueries={({ loading, error, data }) => {
                  if (loading || error || data.deleteBillItem == null) {
                    return [];
                  }
                  return [{
                    query: GET_ITEMS,
                    variables: {id: billId}
                  }];
                }}>
                {(deleteItem, { loading, error, data }) =>{
                  var buttonDisabled = false;
                  if (loading) {
                    buttonDisabled = true;
                  }
                  return (
                    <button className="btn btn-danger pull-right"
                      onClick={e => {
                        deleteItem({ variables: { id: item.id } });
                      }}
                      disabled={buttonDisabled}
                    >
                      Delete
                    </button>
                  );
                }}
              </Mutation>
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

export const ItemList = ({ billId }) => (
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

ItemList.propTypes = {
  billId: PropTypes.string.isRequired
};