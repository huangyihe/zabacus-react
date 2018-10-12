import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Redirect, Link } from 'react-router-dom';
import { setToken } from './UIRoot';

const SIGN_IN = gql`
mutation signIn($user: String!, $pass: String!) {
  tokenAuth(username: $user, password: $pass) {
    token
  }
}
`;

const SignInForm = () => {
  let name;
  let pass;

  return (
    <Mutation mutation={SIGN_IN}>
      {(signIn, { loading, error, data }) => {
        if (data != null && data.tokenAuth != null) {
          setToken(data.tokenAuth.token);
          return <Redirect to="/" />;
        }
        return (
          <form name="signinForm" id="signin-form" onSubmit={
            e => {
              e.preventDefault();
              signIn({
                variables: {
                  user: name.value,
                  pass: pass.value
                }
              });
            }}
          >
            <h3>Sign in</h3>
            <div className="form-group">
              <label htmlFor="signinEmail">Username</label>
              <input type="text" className="form-control" id="signinEmail"
                placeholder="Username" ref={node => {name = node;}} required />
            </div>
            <div className="form-group">
              <label htmlFor="signinPwd">Password</label>
              <input type="password" className="form-control" id="signinPwd"
                placeholder="Password" ref={node => {pass = node}} required />
            </div>
            <p>Need an account? <Link to="/signup">Sign up</Link> here for free!</p>
            <button type="submit" className="btn btn-default">Sign in</button>
            {loading && <p>Signing in...</p>}
            {error && <p>Error :(</p>}
          </form>
        );
      }}
    </Mutation>
  );
};

const SignUpForm = () => {
  return (
    <form id="signup-form" onSubmit={e => e.preventDefault()}>
      <h3>Sign up</h3>
      <div className="form-group">
        <label htmlFor="signupName">Your Name</label>
        <input type="text" className="form-control" id="signupName" placeholder="Name" required />
      </div>
      <div className="form-group">
        <label htmlFor="signupEmail">Email Address</label>
        <input type="email" className="form-control" id="signupEmail" placeholder="Email" required />
      </div>
      <div className="form-group">
        <label htmlFor="signupPwd">Password</label>
        <input type="password" className="form-control" id="signupPwd" placeholder="Password" required />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPwd">Confirm Password</label>
        <input type="password" className="form-control" id="confirmPwd" placeholder="Password again" required />
      </div>
      {/* reCaptcha goes in here */}
      <p>Already have an account? <Link to="/signin">Sign in</Link> here!</p>
      <button type="submit" className="btn btn-primary">Sign up</button>
    </form>
  );
};

export const SignIn = () => (
  <div className="container container-form">
    <SignInForm />
  </div>
);

export const SignUp = () => (
  <div className="container container-form">
    <SignUpForm />
  </div>
);