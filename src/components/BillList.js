import React from 'react';
import moment from 'moment';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import { hasToken } from './UIRoot';

const LIST_BILLS = gql`
{
  listBills {
    id
    name
    date
    createdBy {firstName}
    status
  }
}
`;

export const displayLongDate = (date) => {
  return moment(date).format("YYYY-MM-DD HH:mm");
};

const Bills = (props) => (
  <Query query={LIST_BILLS}>
  {({ loading, error, data }) => {
    if (loading) return <tr><td>Loading...</td><td></td><td></td></tr>;
    if (error) return <tr><td>Error...</td><td></td><td></td></tr>;
    return data.listBills.map(bill => (
      <tr key={bill.id}>
        <td>
          <strong className="event-name">{bill.name}</strong>
          Created by {bill.createdBy.firstName}
        </td>
        <td>
          {displayLongDate(bill.date)}
        </td>
        <td>{/* status or amount? */}
          <strong className="status">{bill.status}</strong>
        </td>
      </tr>
    ));
  }}
  </Query>
);

export const BillList = (props) => {
  if (!hasToken()) {
    return <Redirect to="/" />;
  }
  return (
    <div className="container container-body">
      <div className="row">
        <ol className="breadcrumb">
          <li className="active">"::el.statusName"</li>
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
            <li className="previous disabled"><a href="#"><span aria-hidden="true">&larr;</span> Previous</a></li>
            <li className="next disabled"><a href="#">Next <span aria-hidden="true">&rarr;</span></a></li>
          </ul>
        </nav>
      </div>

    </div>
  );
};