import React from 'react';
import { PropTypes } from 'prop-types';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Redirect } from 'react-router-dom';

const SIGN_IN = gql`
mutation TokenAuth($user: String!, $pass: String!) {
  tokenAuth(username: $user, password: $pass) {
    token
  }
}
`;

class SignInForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    }
  }

  render() {
    const ctl = this.props.signInControl;

    return (
      <Mutation mutation={SIGN_IN}>
      {(tokenAuth, { loading, error, data }) => {
        if (data != null && data.tokenAuth != null) {
          localStorage.setItem('token', data.tokenAuth.token);
          return <Redirect to="/" />;
        }
        return (
          <form name="signinForm" id="signin-form" noValidate onSubmit={
            e => {
              e.preventDefault();
              tokenAuth({
                variables: {
                  user: this.state.username,
                  pass: this.state.password
                }
              });
            }
          }>
            <h3>Sign in</h3>
            <div className="form-group">
              <label htmlFor="signinEmail">Username</label>
              <input type="email" className="form-control" id="signinEmail"
                placeholder="Username" onChange={e => this.setState({username: e.target.value})} required />
            </div>
            <div className="form-group">
              <label htmlFor="signinPwd">Password</label>
              <input type="password" className="form-control" id="signinPwd"
                placeholder="Password" onChange={e => this.setState({password: e.target.value})} required />
            </div>
            <p>Need an account? <a href="#" onClick={ctl.toggleForm}>Sign up</a> here for free!</p>
            <button type="submit" className="btn btn-default">Sign in</button>
            {loading && <p>Signing in...</p>}
            {error && <p>Error :(</p>}
          </form>
        );
      }}
      </Mutation>
    );
  }
}

SignInForm.propTypes = {
  signInControl: PropTypes.object.isRequired
};

const SignUpForm = (props) => {
  const ctl = props.signInControl;

  return (
    <form id="signup-form">
      <h3>Sign up</h3>
      <div className="form-group">
        <label htmlFor="signupName">Your Name</label>
        <input type="text" className="form-control" id="signupName" placeholder="Name" />
      </div>
      <div className="form-group">
        <label htmlFor="signupEmail">Email Address</label>
        <input type="email" className="form-control" id="signupEmail" placeholder="Email" />
      </div>
      <div className="form-group">
        <label htmlFor="signupPwd">Password</label>
        <input type="password" className="form-control" id="signupPwd" placeholder="Password" />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPwd">Confirm Password</label>
        <input type="password" className="form-control" id="confirmPwd" placeholder="Password again" />
      </div>
      {/* reCaptcha goes in here */}
      <p>Already have an account? <a href="#" onClick={ctl.toggleForm}>Sign in</a> here!</p>
      <button type="submit" className="btn btn-primary">Sign up</button>
    </form>
  );
};

SignUpForm.propTypes = {
  signInControl: PropTypes.object.isRequired
};

export class SignIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      signInActive: true
    }

    this.toggleForm = this.toggleForm.bind(this);

    this.signInController = {
      toggleForm: this.toggleForm
    }
  }

  toggleForm(e) {
    e.preventDefault();
    this.setState({
      signInActive: !this.state.signInActive
    });
  }

  render() {
    let form;
    if (this.state.signInActive) {
      form = <SignInForm signInControl={this.signInController} />
    } else {
      form = <SignUpForm signInControl={this.signInController} />
    }

    return (
      <div className="container container-form">
        {form}
      </div>
    );
  }
}

SignIn.propTypes = {
  rootControl: PropTypes.object.isRequired
};