import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Query, Mutation } from 'react-apollo';
import { avatarLink } from './BillDetails';
import { GET_ME } from './UIRootNav';
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
    Change your avatar at <a href="https://en.gravatar.com/" target="_blank">Gravatar</a>.
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
        <div className="container container-body" style={{maxWidth: 560}}>
          <div className="row">
            <ol className="breadcrumb">
              <li className="active"><em>beta</em></li>
            </ol>
          </div>

          <div className="row vertical-align">
            <div className="col-xs-12">
              <h1>{heading}</h1>
            </div>
          </div>

          <div className="row">
            <div className="panel panel-default">
              <div className="panel-heading">Profile</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <TableCell disp={[fieldTitle("Username"), getfield(data, 'username')]} />
                  <TableCell disp={[fieldTitle("Email"), getfield(data, 'email')]} />
                  <TableCell disp={[fieldTitle("First Name"), getfield(data, 'firstName')]} />
                  <TableCell disp={[fieldTitle("Last Name"), getfield(data, 'lastName')]} />
                  <TableCell disp={[fieldTitle("Avatar"), fieldAvtr(data)]} />
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

export const EditProfileView = () => (
  <Query query={GET_MY_PROFILE} >
    {({ loading, error, data }) => {
      if (loading || error) return <h3>Loading...</h3>;
      let me = data.me;
      return (
        <Mutation mutation={UPDATE_PROFILE}
          refetchQueries={({ loading, error, data }) => {
            if (loading || error) return [];
            return [{ query: GET_ME }, { query: GET_MY_PROFILE }];
          }}
        >
          {(updateProfile, { loading, error, data }) => {
            let fname;
            let lname;
            let email;
            let oldpass;
            let newpass;
            let newpass2;

            let errorText = null;
            let btnDisable = false;

            const genParams = () => {
              var params = {};
              if (fname.value !== me.firstName) {
                params.first = fname.value;
              }
              if (lname.value !== me.lastName) {
                params.last = lname.value;
              }
              if (email.value !== me.email) {
                params.email = email.value;
              }
              if (newpass.value !== ""
                    && newpass2.value === newpass.value
                    && oldpass.value !== "") {
                params.newpass = newpass.value;
                params.oldpass = oldpass.value;
              }
              if (Object.keys(params).length === 0) {
                return null;
              }
              return params;
            };

            const checkPasswords = () => {
              if (newpass.value !== "") {
                if (newpass2.value !== newpass.value
                      || oldpass.value === "") {
                  return false;
                }
              }
              return true;
            };

            if (loading) {
              btnDisable = true;
            }
            if (error) {
              errorText = "That didn't work. Check your password?";
            }
            if (data && data.updateUser) {
              return <Redirect to="/profile" />;
            }

            return (
              <div className="container container-form">
              <form onSubmit={e => {
                  e.preventDefault();
                  if (!checkPasswords()) {
                    // XXX TODO: this doesn't really work
                    errorText = "Please enter the same passwords!";
                    return;
                  }
                  const params = genParams();
                  if (params != null) {
                    updateProfile({ variables: params });
                  }
                }}
              >
                <h3>Edit Profile</h3>
                <div className="form-group">
                  <label htmlFor="updateFName">First Name</label>
                  <input type="text" className="form-control"
                    defaultValue={me.firstName} ref={node => fname = node} />
                </div>
                <div className="form-group">
                  <label htmlFor="updateLName">Last Name</label>
                  <input type="text" className="form-control"
                    defaultValue={me.lastName} ref={node => lname = node} />
                </div>
                <div className="form-group">
                  <label htmlFor="updateEmail">Email Address</label>
                  <input type="email" className="form-control"
                    defaultValue={me.email} ref={node => email = node}/>
                </div>
                <div className="form-group">
                  <label htmlFor="oldPwd">Old Password</label>
                  <input type="password" className="form-control"
                    placeholder="Old password" ref={node => oldpass = node} />
                </div>
                <div className="form-group">
                  <label htmlFor="newPwd">New Password</label>
                  <input type="password" className="form-control"
                    placeholder="New password" ref={node => newpass = node} />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmNewPwd">Confirm Password</label>
                  <input type="password" className="form-control"
                    placeholder="Confirm new password" ref={node => newpass2 = node} />
                </div>
                {errorText && <p>{errorText}</p>}
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
    }}
  </Query>
);