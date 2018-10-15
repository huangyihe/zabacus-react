import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import { avatarLink } from './BillDetails';
import { GET_ME } from './UIRootNav';
import { firstErrorMessage } from '../utils/errors';
import LinkButton from './LinkButton';

const GET_MY_PROFILE = gql`
query {
  me {
    id
    username
    firstName
    lastName
    email
  }
}
`;

const fieldTitle = (text) => <strong>{text}</strong>;
const fieldAvtr = (data) => {
  if (data == null || data.me == null) return null;
  let email = data.me.email;
  return <img className="avatar" alt="avatar" height="40" width="40" src={avatarLink(email)} />;
}

const TableCell = ({ disp }) => <tr>{disp.map((ele, i) => <td key={i}>{ele}</td>)}</tr>;

const gravatarPrompt = (
  <em>
    Change your avatar at{' '}
    <a href="https://en.gravatar.com/"
      target="_blank"
      rel="noopener noreferrer">
      Gravatar
    </a>.
  </em>
);

TableCell.propTypes = {
  disp: PropTypes.array.isRequired
};

const getfield = (data, fn) => {
  if (data && data.me) {
    return data.me[fn];
  }
  return null;
};

export const ProfileView = () => (
  <Query query={GET_MY_PROFILE} >
    {({ loading, error, data }) => {
      let heading = "User Profile";
      if (loading) { heading = "Loading..."; }
      if (error) { heading = "Error :("; }
      return (
        <div className="container container-form">
          <div className="row vertical-align">
            <div className="col-xs-12">
              <h3>{heading}</h3>
            </div>
          </div>
          <div className="row">
            <div className="panel panel-default">
              <div className="panel-heading"><em>User ID: {getfield(data, 'id')}</em></div>
              <table className="table">
                <tbody>
                  <TableCell disp={[fieldTitle("Avatar"), fieldAvtr(data)]} />
                  <TableCell disp={[fieldTitle("Username"), getfield(data, 'username')]} />
                  <TableCell disp={[fieldTitle("Email"), getfield(data, 'email')]} />
                  <TableCell disp={[fieldTitle("First Name"), getfield(data, 'firstName')]} />
                  <TableCell disp={[fieldTitle("Last Name"), getfield(data, 'lastName')]} />
                  <TableCell disp={[null, gravatarPrompt]} />
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td>
                      <LinkButton to="/profile/edit" className="btn btn-primary pull-right">
                        Edit Profile
                      </LinkButton>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      );
    }}
  </Query>
);

const UPDATE_PROFILE = gql`
mutation updateProfile($email: String, $first: String, $last: String, $newpass: String, $oldpass: String) {
  updateUser(email: $email, firstName: $first, lastName: $last, newPassword: $newpass, oldPassword: $oldpass) {
    user {
      id
    }
  }
}
`;

class EditProfileForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorText: null
    };

    this.fname = null;
    this.lname = null;
    this.email = null;
    this.oldpass = null;
    this.newpass = null;
  }

  genParams() {
    var params = {};
    const me = this.props.me;
    if (this.fname.value !== me.firstName) {
      params.first = this.fname.value;
    }
    if (this.lname.value !== me.lastName) {
      params.last = this.lname.value;
    }
    if (this.email.value !== me.email) {
      params.email = this.email.value;
    }
    if (this.newpass.value !== ""
          && this.newpass2.value === this.newpass.value
          && this.oldpass.value !== "") {
      params.newpass = this.newpass.value;
      params.oldpass = this.oldpass.value;
    }
    if (Object.keys(params).length === 0) {
      return null;
    }
    return params;
  }

  checkPasswords() {
    if (this.newpass.value !== "") {
      if (this.newpass2.value !== this.newpass.value
            || this.oldpass.value === "") {
        return false;
      }
    }
    return true;
  };

  render() {
    return (
      <Mutation mutation={UPDATE_PROFILE}
        refetchQueries={({ loading, error, data }) => {
          if (loading || error) return [];
          return [{ query: GET_ME }, { query: GET_MY_PROFILE }];
        }}
      >
        {(updateProfile, { loading, error, data }) => {
          let me = this.props.me;
          let btnDisable = false;
          if (loading) {
            btnDisable = true;
          }
          if (data && data.updateUser) {
            return <Redirect to="/profile" />;
          }

          return (
            <div className="container container-form">
            <form onSubmit={e => {
                e.preventDefault();
                if (!this.checkPasswords()) {
                  this.setState({
                    errorText: "Passwords don't match."
                  });
                  return;
                }
                const params = this.genParams();
                if (params != null) {
                  updateProfile({ variables: params });
                }
              }}
            >
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label htmlFor="updateFName">First Name</label>
                <input type="text" className="form-control"
                  defaultValue={me.firstName} ref={node => this.fname = node} />
              </div>
              <div className="form-group">
                <label htmlFor="updateLName">Last Name</label>
                <input type="text" className="form-control"
                  defaultValue={me.lastName} ref={node => this.lname = node} />
              </div>
              <div className="form-group">
                <label htmlFor="updateEmail">Email Address</label>
                <input type="email" className="form-control"
                  defaultValue={me.email} ref={node => this.email = node}/>
              </div>
              <div className="form-group">
                {error && <p>{firstErrorMessage(error)}</p>}
                <label htmlFor="oldPwd">Old Password</label>
                <input type="password" className="form-control"
                  placeholder="Old password" ref={node => this.oldpass = node} />
              </div>
              <div className="form-group">
                <label htmlFor="newPwd">New Password</label>
                <input type="password" className="form-control"
                  placeholder="New password" ref={node => this.newpass = node} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPwd">Confirm Password</label>
                <input type="password" className="form-control"
                  placeholder="Confirm new password" ref={node => this.newpass2 = node} />
              </div>
              {this.state.errorText && <p>{this.state.errorText}</p>}
              <LinkButton to="/profile"
                className="btn btn-default pull-left"
                disabled={btnDisable}
              >
                Cancel
              </LinkButton>
              <button type="submit"
                className="btn btn-primary pull-right"
                disabled={btnDisable}
              >
                Save
              </button>
            </form>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

EditProfileForm.propTypes = {
  me: PropTypes.object.isRequired
};

export const EditProfileView = () => (
  <Query query={GET_MY_PROFILE} >
    {({ loading, error, data }) => {
      if (loading) return <h3>Loading...</h3>;
      if (error) return <h3>Error :(</h3>;
      return <EditProfileForm me={data.me} />;
    }}
  </Query>
);