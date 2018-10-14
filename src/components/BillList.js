import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link, Redirect } from 'react-router-dom';
import { hasToken } from './UIRoot';
import { displayStatus, displayLongDate } from '../utils/format';

export const LIST_BILLS = gql`
{
  listBills {
    id
    name
    date
    createdBy {
      id
      firstName
    }
    status
  }
}
`;

const EmptyRow = ({ disp }) => (
  <tr>
    <td>
      <strong className="event-name">{disp}</strong>
    </td>
    <td></td>
    <td></td>
  </tr>
);

EmptyRow.propTypes = {
  disp: PropTypes.string.isRequired
};

const Bills = (props) => (
  <Query query={LIST_BILLS}>
  {({ loading, error, data }) => {
    if (loading) return <EmptyRow disp="Loading..."/>;
    if (error) return <EmptyRow disp="Error :("/>;
    return data.listBills.map(bill => (
      <tr key={bill.id}>
        <td>
          <Link to={"/bills/details/" + bill.id}>
            <strong className="event-name">{bill.name}</strong>
          </Link>
          Created by {bill.createdBy.firstName}
        </td>
        <td>
          {displayLongDate(bill.date)}
        </td>
        <td>{/* status or amount? */}
          <strong className="status">{displayStatus(bill.status)}</strong>
        </td>
      </tr>
    ));
  }}
  </Query>
);

export const BillList = () => {
  if (!hasToken()) {
    return <Redirect to="/" />;
  }
  return (
    <div className="container container-body">
      <div className="row">
        <ol className="breadcrumb">
          <li className="active">Status: not implemented</li>
        </ol>
      </div>

      {/* event/item title */}
      <div className="row vertical-align">
        <div className="col-xs-12">
          <h1>List Bills</h1>
        </div>
      </div>

      <div className="row">
        <div className="panel panel-default">
          <div className="panel-heading">Bills</div>
          <table className="table">
            <tbody>
              <tr>
                <th>{/*title/owner*/}</th>
                <th>Created On</th>
                <th>Bill Status</th>
              </tr>
              <Bills />
            </tbody>
          </table>
        </div>
      </div>

      {/* pager */}
      <div className="row-fluid">
        <nav>
          <ul className="pager">
            <li className="previous disabled">
              <Link to="/bills/list"><span aria-hidden="true">&larr;</span> Previous</Link>
            </li>
            <li className="next disabled">
              <Link to="/bills/list">Next <span aria-hidden="true">&rarr;</span></Link>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  );
};