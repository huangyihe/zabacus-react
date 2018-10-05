import md5 from 'md5';
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { displayLongDate } from './BillList';

const avatarLink = (email) => {
  const hashEmail = email ? email : "";
  return "https://www.gravatar.com/avatar/" + md5(hashEmail) + "?d=identicon";
}

const EmptyLi = ({ disp }) => (
  <li className="list-group-item clearfix">
    <strong className="member-name">{disp}</strong>
  </li>
);

const GET_MEMBERS = gql`
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
}
`;

const MemberList = ({ billId }) => (
  <Query query={GET_MEMBERS} variables={{ id: billId }}>
    {({ loading, error, data }) => {
      if (loading) return <EmptyLi disp="Loading..." />;
      if (error) return <EmptyLi disp="Error :(" />;
      if (data.showBill == null) return <EmptyLi disp="Error :(" />;
      if (data.showBill.people.length === 0) {
        return <EmptyLi disp="No members in this list (this can't happen)." />;
      }

      return data.showBill.people.map( member => {
        let ownerTag;
        if (member.id === data.showBill.createdBy.id) {
          ownerTag = (
            <span className="pull-right owner-marker">
              Owner
            </span>
          );
        } else {
          ownerTag = null;
        }
        return (
          <li key={member.id} className="list-group-item clearfix">
            <a className="member-link pull-left" href="#">
              <img className="avatar" alt="avatar" height="40" width="40" src={avatarLink(member.email)} />
              <div className="member-info">
                <strong className="member-name">{member.firstName + " " + member.lastName}</strong>
                {member.email + " (" + member.username + ")"}
              </div>
            </a>
            {ownerTag}
          </li>
        );
      });
    }}
  </Query>
);

const GET_DETAILS = gql`
query getMembers($id: ID!) {
  showBill(bid: $id) {
    id
    date
    desc
  }
}
`;

export const BillDetailsTab = ({ billId }) => (
  <Query query={GET_DETAILS} variables={{ id: billId }}>
    {({ loading, error, data }) => {
      if (loading) return <h1>Loading</h1>;
      if (error) return <h1>Error :(</h1>;
      const bill = data.showBill;
      if (bill == null) return <h1>Error :(</h1>;
      return (
        <div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">Members</div>
              <ul className="list-group">
                <MemberList billId={billId} />
                <li className="list-group-item">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Search by username." />
                    <span className="input-group-btn">
                      <button className="btn btn-default" type="button">Add as Member</button>
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">Bill Details</div>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Created on:</td>
                    <td>{displayLongDate(bill.date)}</td>
                  </tr>
                  <tr>
                    <td>Description:</td>
                    <td>{bill.desc}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <button type="button" className="btn btn-default btn-sm pull-right">
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }}
  </Query>
);

BillDetailsTab.propTypes = {
  billId: PropTypes.string.isRequired
};