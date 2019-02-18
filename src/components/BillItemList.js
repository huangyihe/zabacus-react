import React from 'react';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { currencyFormat, displayShortDate } from '../utils/format';

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
      desc
      date
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
  me {
    id
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
        item => {
          let myShare = null;

          item.assignments.map(ass => {
            if (ass.user.id === data.me.id) {
              myShare = <td><strong className="amount">{currencyFormat("$", ass.amount)}</strong>My share</td>;
            }
            return null;
          });
          if (myShare == null) {
            if (item.paidBy.id === data.me.id) {
              myShare = <td><strong className="amount">{currencyFormat("$", 0.00)}</strong>My share</td>;
            } else {
              myShare = <td>Not involved</td>;
            }
          }

          const descPopover = (
            <Popover id="popover-basic" title={<strong>{item.name}</strong>}>
              {item.desc}
            </Popover>
          );

          return (
          <tr key={item.id} className="clearfix">
            <OverlayTrigger trigger="hover" placement="left" overlay={descPopover}>
            <td>
              <strong className="member-name">{item.name}</strong>
              Created by {item.createdBy.firstName} on {displayShortDate(item.date)}
            </td>
            </OverlayTrigger>
            <td>
              <strong className="amount">{currencyFormat("$", item.total)}</strong>
              Paid by {item.paidBy.firstName}
            </td>
            {myShare}
            <td>
              <Mutation mutation={DELETE_ITEM}
                refetchQueries={({ loading, error, data }) => {
                  if (loading || error || data.deleteBillItem == null) {
                    return [];
                  }
                  return [{
                    query: GET_ITEMS,
                    variables: { id: billId }
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
          );
        }
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