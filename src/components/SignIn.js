import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Redirect, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { setToken } from './UIRoot';
import { firstErrorMessage } from '../utils/errors';

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
            {error && <p>{firstErrorMessage(error)}</p>}
          </form>
        );
      }}
    </Mutation>
  );
};

const USER_REG = gql`
mutation register($user: String!, $first: String!, $last: String!, $email: String!, $pass: String!, $recaptcha: String!) {
  createUser(username: $user, firstName: $first, lastName: $last, email: $email, password: $pass, recaptcha: $recaptcha) {
    user {
      id
    }
  }
}
`;

let siteKey;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  siteKey = "6LeOBnUUAAAAAExKgkobVokMi3-kYfonWg1RYoqc";
} else {
  siteKey = "6LeCXuYSAAAAALNqYbht-l9V3yLYqAR8BeQOmSCY";
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorText: null
    };

    // recaptcha control object
    this.captcha = null;

    // recaptcha token
    this.captchaToken = null;

    // form inputs
    this.user = null;
    this.first = null;
    this.last = null;
    this.email = null;
    this.pass = null;
    this.pass2 = null;

    this.handleCaptcha = this.handleCaptcha.bind(this);
  }

  handleCaptcha(response) {
    this.captchaToken = response;
  }

  static isEmpty(element) {
    return element.value === "";
  }
  static isAnyEmpty(elements) {
    let ret = false;
    elements.map(e => {
      if (ret) {
        return null;
      }
      if (SignUpForm.isEmpty(e)) {
        ret = true;
      }
      return null;
    });
    return ret;
  }

  validateForm() {
    if (!this.captchaToken) {
      return "Please check reCaptcha.";
    }
    if (!this.user || !this.first || !this.last
        || !this.email || !this.pass || !this.pass2) {
      return "Please fill out all fields.";
    }
    if (SignUpForm.isAnyEmpty([
      this.user, this.first, this.last,
      this.email, this.pass, this.pass2
    ])) {
      return "No empty inputs please.";
    }
    if (this.pass.value !== this.pass2.value) {
      return "Passwords much match.";
    }
    return "OK";
  }

  genParams() {
    const params = {
      user: this.user.value,
      first: this.first.value,
      last: this.last.value,
      email: this.email.value,
      pass: this.pass.value,
      recaptcha: this.captchaToken
    };
    return params;
  }

  render() {
    return (
      <Mutation mutation={USER_REG} >
        {(register, { loading, error, data }) => {
          let btnDisable = false;
          if (loading) {
            btnDisable = true;
          }
          if (data && data.createUser) {
            return <Redirect to="/signin" />;
          }
          return (
            <form id="signup-form"
              onSubmit={e => {
                e.preventDefault();
                const validateMsg = this.validateForm();
                if (validateMsg !== "OK") {
                  this.setState({ errorText: validateMsg });
                  this.captcha.reset();
                  return;
                }
                const params = this.genParams();
                register({ variables: params });
                if (this.captcha) {
                  this.captcha.reset();
                }
              }}
            >
              <h3>Sign up</h3>
              <div className="form-group">
                <label htmlFor="signupUser">Choose your username</label>
                <input ref={node => this.user = node} required
                  type="text" className="form-control" id="signupUser" placeholder="Username" />
              </div>
              <div className="form-group">
                <label htmlFor="signupFirst">Your First Name</label>
                <input ref={node => this.first = node} required
                  type="text" className="form-control" id="signupFirst" placeholder="First Name" />
              </div>
              <div className="form-group">
                <label htmlFor="signupLast">Your Last Name</label>
                <input ref={node => this.last = node} required
                  type="text" className="form-control" id="signupLast" placeholder="Last Name" />
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">Email Address</label>
                <input ref={node => this.email = node} required
                  type="email" className="form-control" id="signupEmail" placeholder="Email" />
              </div>
              <div className="form-group">
                <label htmlFor="signupPwd">Password</label>
                <input ref={node => this.pass = node} required
                  type="password" className="form-control" id="signupPwd" placeholder="Password" />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPwd">Confirm Password</label>
                <input ref={node => this.pass2 = node} required
                  type="password" className="form-control" id="confirmPwd" placeholder="Password again" />
              </div>
              {this.state.errorText && <p>{this.state.errorText}</p>}
              {error && <p>{firstErrorMessage(error)}</p>}
              <ReCAPTCHA
                ref={node => this.captcha = node}
                size="normal"
                render="explicit"
                sitekey={siteKey}
                onChange={this.handleCaptcha}
              />
              <p>Already have an account? <Link to="/signin">Sign in</Link> here!</p>
              <button type="submit" className="btn btn-primary" disabled={btnDisable} >Sign up</button>
            </form>
          );
        }}
      </Mutation>
    );
  }
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