import md5 from 'md5';
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import { Button, Modal } from 'react-bootstrap';
import { FormGroup, FormControl} from 'react-bootstrap';
import { ControlLabel, HelpBlock } from 'react-bootstrap';
import { displayLongDate } from '../utils/format';
import { LIST_BILLS } from './BillList';
import { firstErrorMessage } from '../utils/errors';

export const avatarLink = (email) => {
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

export const MemberBlock = ({ member }) => (
  <span className="member-link pull-left" href="#">
    <img className="avatar" alt="avatar" height="40" width="40" src={avatarLink(member.email)} />
    <div className="member-info">
      <strong className="member-name">{member.firstName + " " + member.lastName}</strong>
      {`(${member.username})`}
    </div>
  </span>
);

MemberBlock.propTypes = {
  member: PropTypes.object.isRequired
};

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
            <MemberBlock member={member} />
            {ownerTag}
          </li>
        );
      });
    }}
  </Query>
);

const GET_DETAILS = gql`
query getDetails($id: ID!) {
  showBill(bid: $id) {
    id
    name
    date
    desc
    status
    createdBy {
      id
    }
  }
  me {
    id
  }
}
`;

const ADD_USER = gql`
mutation addUser($id: ID!, $name: String!) {
  addUserToBill(bid: $id, uname: $name) {
    bill {
      id
    }
  }
}
`;

const UserSearchBar = ({ billId }) => {
  let userSearch;

  return (
    <div className="input-group">
      <input type="text" className="form-control" placeholder="Search by username"
        ref={node => {userSearch = node;}} />
      <span className="input-group-btn">
        <Mutation mutation={ADD_USER}
          refetchQueries={({ loading, error, data }) => {
            if (loading || error) {
              return [];
            }
            return [{
              query: GET_MEMBERS,
              variables: { id: billId }
            }];
          }}
        >
          {(addUser, { loading, error, data }) => {
            return (
              <button className="btn btn-default" type="button"
                onClick={e => {
                  e.preventDefault();
                  if (userSearch.value === "") {
                    return;
                  }
                  addUser({
                    variables: {
                      id: billId,
                      name: userSearch.value
                    }
                  });
                  userSearch.value = "";
                }}
              >
                Add as Member
              </button>
            );
          }}
        </Mutation>
      </span>
    </div>
  );
}

export const BillDetailsTab = ({ billId }) => (
  <Query query={GET_DETAILS} variables={{ id: billId }}>
    {({ loading, error, data }) => {
      if (loading) return <h1>Loading</h1>;
      if (error) return <h1>Error :(</h1>;
      const bill = data.showBill;
      if (bill == null) return <h1>Error :(</h1>;
      let deleteButton = (data.me.id === bill.createdBy.id) ?
        <DeleteBillComponent billId={billId} billName={bill.name} /> : null;
      let editButton = <UpdateBillComponent billId={billId} billName={bill.name} billDesc={bill.desc} billStatus={bill.status} />;
      return (
        <div className="row-fluid">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">Members</div>
              <ul className="list-group">
                <MemberList billId={billId} />
                <li className="list-group-item">
                  <UserSearchBar billId={billId} />
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
                    <td>{deleteButton}</td>
                    <td>
                      {/*<button type="button" className="btn btn-default btn-sm pull-right">
                        Edit
                      </button>*/
                      editButton}
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

const DELETE_BILL = gql`
mutation deleteBill($id: ID!) {
  deleteBill(bid: $id) {
    result
  }
}
`;

class DeleteBillComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      value: ""
    };

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getValidationState() {
    if (this.state.value === "") {
      return null;
    }
    if (this.props.billName === this.state.value) {
      return "success";
    } else {
      return "error";
    }
  }
  formValid() {
    return (this.props.billName === this.state.value);
  }

  handleShow() {
    this.setState({ show: true });
  }
  handleClose() {
    this.setState({ show: false });
  }
  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <div>
        <Button bsStyle="danger" bsSize="small" onClick={this.handleShow}>
          Delete
        </Button>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Bill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Mutation mutation={DELETE_BILL} variables={{ id: this.props.billId }}
              refetchQueries={({ loading, error, data }) => {
                if (loading || error) {
                  return [];
                }
                return [{ query: LIST_BILLS }];
              }}
            >
              {(deleteBill, {loading, error, data}) => {
                let btnDisabled = false;
                if (!this.formValid() || loading) {
                  btnDisabled = true;
                }
                if (data && data.deleteBill) {
                  return <Redirect to="/bills/list" />;
                }
                return (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      deleteBill();
                    }}
                  >
                    <FormGroup
                      controlId="deleteBillForm"
                      validationState={this.getValidationState()}
                    >
                      <ControlLabel>Please enter the name of the bill to proceed with deletion:</ControlLabel>
                      <FormControl
                        type="text"
                        value={this.state.value}
                        onChange={this.handleChange}
                      />
                      <FormControl.Feedback />
                      <HelpBlock>Note: This action cannot be undone!</HelpBlock>
                      {error && <p>{firstErrorMessage(error)}</p>}
                      <Button bsStyle="danger" type="submit" disabled={btnDisabled}>Delete</Button>
                    </FormGroup>
                  </form>
                );
              }}

            </Mutation>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

DeleteBillComponent.propTypes = {
  billId: PropTypes.string.isRequired,
  billName: PropTypes.string.isRequired
};

const UPDATE_BILL = gql`
mutation updateBill($id: ID!, $ds: String, $nm: String, $st: String){
  updateBill(bid:$id, desc:$ds, name:$nm, status:$st) {
    bill {
      id
    }
  }
}
`;

class UpdateBillComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      name: this.props.billName,
      desc: this.props.billDesc,
      status: this.props.billStatus
    };

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleBillNameChange = this.handleBillNameChange.bind(this);
    this.handleBillDescChange = this.handleBillDescChange.bind(this);
    this.handleBillStatusChange = this.handleBillStatusChange.bind(this);
  }

  getBillNameValidationState() {
    if (this.state.name === "") {
      return "error";
    } else {
      return "success";
    }
  }
  getBillDescValidationState() {
    if (this.state.desc === "") {
      return "error";
    } else {
      return "success";
    }
  }

  formValid() {
    return (this.state.name !== "" && this.state.desc !== "");
  }

  handleShow() {
    this.setState({ show: true });
  }
  handleClose() {
    this.setState({ show: false });
  }
  handleBillNameChange(e) {
    this.setState({ name: e.target.value });
  }
  handleBillDescChange(e) {
    this.setState({ desc: e.target.value });
  }
  handleBillStatusChange(e) {
    this.setState({ status: e.target.value });
  }

  genParams() {
    if (!this.formValid()) {
      return null;
    }
    return {
      id: this.props.billId,
      nm: this.state.name,
      ds: this.state.desc,
      st: this.state.status
    };
  }

  render() {
    return (
      <div>
        <Button className="pull-right" bsStyle="default" bsSize="small" onClick={this.handleShow}>
          Edit
        </Button>
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Update Bill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Mutation mutation={UPDATE_BILL}
              refetchQueries={({ loading, error, data }) => {
                if (loading || error) {
                  return [];
                }
                return [{
                  query: GET_DETAILS,
                  variables: { id: this.props.billId }
                }];
              }}
              onCompleted={data => {
                if (data && data.updateBill) {
                  this.handleClose();
                }
              }}
            >
              {(updateBill, {loading, error, data}) => {
                let btnDisabled = false;
                if (!this.formValid() || loading) {
                  btnDisabled = true;
                }
                return (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const params = this.genParams();
                      if (params !== null) {
                        updateBill({ variables: params });
                      }
                    }}
                  >
                    <FormGroup
                      controlId="updateBillName"
                      validationState={this.getBillNameValidationState()}
                    >
                      <ControlLabel>Update bill name here:</ControlLabel>
                      <FormControl
                        type="text"
                        value={this.state.name}
                        onChange={this.handleBillNameChange}
                      />
                    </FormGroup>
                    <FormGroup
                      controlId="updateBillDesc"
                      validationState={this.getBillDescValidationState()}
                    >
                      <ControlLabel>Update bill description here:</ControlLabel>
                      <FormControl
                        type="text"
                        value={this.state.desc}
                        onChange={this.handleBillDescChange}
                      />
                    </FormGroup>
                    <FormGroup controlId="updateBillState">
                      <ControlLabel>Update bill status:</ControlLabel>
                      <FormControl
                        componentClass="select"
                        value={this.state.status}
                        onChange={this.handleBillStatusChange}
                      >
                        <option value={"OPN"}>Open</option>
                        <option value={"STL"}>Settled</option>
                        <option value={"DIS"}>Dispute</option>
                      </FormControl>
                      {error && <p>{firstErrorMessage(error)}</p>}
                    </FormGroup>
                    <FormGroup controlId="updateBillSubmit">
                      <Button bsStyle="success" type="submit" disabled={btnDisabled}>Update</Button>
                    </FormGroup>
                  </form>
                );
              }}

            </Mutation>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

UpdateBillComponent.propTypes = {
  billId: PropTypes.string.isRequired,
  billName: PropTypes.string.isRequired,
  billDesc: PropTypes.string.isRequired,
  billStatus: PropTypes.string.isRequired
};