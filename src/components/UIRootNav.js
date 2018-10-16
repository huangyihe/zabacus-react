import React from 'react';
import gql from 'graphql-tag';
import { PropTypes } from 'prop-types';
import { FormGroup, FormControl, ControlLabel, Button, Modal } from 'react-bootstrap';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Query, Mutation } from 'react-apollo';
import { Link, Redirect } from 'react-router-dom';
import { hasToken, resetToken } from './UIRoot';
import LinkButton from './LinkButton';
import { LIST_BILLS } from './BillList';
import { firstErrorMessage } from '../utils/errors';

export const GET_ME = gql`
query {
  me {
    id
    firstName
    lastName
  }
}
`;

const UserNameDisplay = () => (
  <Query query={GET_ME}>
    {({ loading, error, data}) => {
      if (loading) return <span>Loading...</span>;
      if (error) {
        // token invalid
        resetToken();
        return <Redirect to="/signin" />;
      }
      return <span>{`${data.me.firstName} ${data.me.lastName}`}</span>;
    }}
  </Query>
);

const NEW_BILL = gql`
mutation newBill($name: String!, $desc: String!) {
  createBill(name: $name, desc: $desc) {
    bill {
      id
    }
  }
}
`;

class NewBillForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorText: null
    };

    this.billName = null;
    this.billDesc = null;
  }

  formNotValid() {
    return (!this.billName || !this.billDesc
      || this.billName.value === "" || this.billDesc.value === "");
  }

  genParams() {
    if (this.formNotValid()) {
      this.setState({
        errorText: "Please fill out all fields."
      })
      return null;
    }
    return {
      name: this.billName.value,
      desc: this.billDesc.value
    };
  }

  render() {
    return (
      <Mutation mutation={NEW_BILL} refetchQueries={({ loading, error, data }) => {
        if (loading || error || data.createBill == null) {
          return [];
        }
        return [{ query: LIST_BILLS }];
        }}
        onCompleted={data => this.props.onSuccess()}
      >
        {(newBill, { loading, error, data }) => {
          var btnDisabled = false;
          if (loading) {
            btnDisabled = true;
          }
          return (
            <form className="form"
              onSubmit={e => {
                e.preventDefault();
                const params = this.genParams();
                if (params != null) {
                  newBill({ variables: params });
                }
              }}
            >
              <FormGroup>
                <ControlLabel>Name your bill</ControlLabel>
                <FormControl type="text" inputRef={node => this.billName = node}
                  placeholder="Awesome road trip" />
                <ControlLabel>Description</ControlLabel>
                <FormControl componentClass="textarea"
                  rows={3} inputRef={node => this.billDesc = node}
                  placeholder="We flew to Colorado, then followed I-70 all the way to Arizona..." />
              </FormGroup>
              {loading && <p>Please wait...</p>}
              {error && <p>{firstErrorMessage(error)}</p>}
              {this.state.errorText && <p>{this.state.errorText}</p>}
              <Button type="submit" bsSize="large" bsStyle="primary"
                disabled={btnDisabled}>Create</Button>
            </form>
          );
        }}
      </Mutation>
    );
  }
};

NewBillForm.propTypes = {
  onSuccess: PropTypes.func.isRequired
};

export class UIRootNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow() {
    this.setState({ show: true });
  }
  handleClose() {
    this.setState({ show: false });
  }

  render() {
    let navRight;
    let navLeft;

    if (hasToken()) {
      navRight = (
        <Nav pullRight>
          <NavDropdown title={<UserNameDisplay />} id="user-dropdown">
            <LinkContainer to="/profile">
              <MenuItem>Profile</MenuItem>
            </LinkContainer>
            <LinkContainer to="/profile">
              <MenuItem>Settings</MenuItem>
            </LinkContainer>
            <MenuItem divider />
            <LinkContainer to="/signout">
              <MenuItem>Sign out</MenuItem>
            </LinkContainer>
          </NavDropdown>
        </Nav>
      );

      navLeft = (
        <Nav>
          <NavDropdown eventKey={1} title="List Bills" id="list-bills-dropdown">
            <MenuItem eventKey={1.1}>All bills</MenuItem>
            <MenuItem eventKey={1.2}>Open bills</MenuItem>
            <MenuItem eventKey={1.3}>Created by me</MenuItem>
          </NavDropdown>
          <NavItem onClick={this.handleShow}>
            Create New Bill
          </NavItem>
        </Nav>
      );
    } else {
      // Not logged in
      navRight = (
        <Nav pullRight>
          <LinkButton
            to="/signin" type="button"
            className="btn btn-success navbar-btn sign-btn"
          >
            Sign in
          </LinkButton>
          <LinkButton
            to="/signup" type="button"
            className="btn btn-default navbar-btn sign-btn"
          >
            Sign up
          </LinkButton>
        </Nav>
      );
      navLeft = null;
    }

    return (
      <header role="navigation">
        <Navbar inverse collapseOnSelect staticTop className="navbar-no-margin">
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">ZAbacus</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            {navLeft}
            {navRight}
          </Navbar.Collapse>
        </Navbar>

        <Modal show={this.state.show} onHide={this.handleClose} >
          <Modal.Header closeButton>
            <Modal.Title>Create a Bill</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewBillForm onSuccess={this.handleClose} />
          </Modal.Body>
        </Modal>
      </header>
    );
  }
};