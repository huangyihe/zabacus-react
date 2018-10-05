import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import LinkButton from './LinkButton';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_ME = gql`
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
  {
    ({ loading, error, data}) => {
      if (loading) return <span>Loading...</span>;
      if (error) {
        // token invalid
        localStorage.removeItem('token');
        return <Redirect to="/signin" />;
      }
      return <span>{data.me.firstName + " " + data.me.lastName}</span>;
    }
  }
  </Query>
);

export class UIRootNav extends React.Component {
  render() {
    const rctl = this.props.rootControl;
    let rightHeader;
    let newBillView;

    if (rctl.userIsAuthenticated()) {
      rightHeader = (
        <ul className="nav navbar-nav navbar-right">
          <li className="dropdown">
            <a href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button" aria-haspopup="true"
              aria-expanded="false"
            >
              <UserNameDisplay />
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#">Profile</a></li>
              <li><a href="#">Settings</a></li>
              <li role="separator" className="divider"></li>
              <li><a href="#">Sign out</a></li>
            </ul>
          </li>
        </ul>
      );

      newBillView = (
        <ul className="nav navbar-nav navbar-left">
          <li className="dropdown">
            <a href="#"
              className="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              List Events
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#">Unsettled</a></li>
              <li><a href="#">All</a></li>
              <li><a href="#">Created by me</a></li>
            </ul>
          </li>
          {/* new events drop down */}
          <li className="dropdown" id="menuLogin">
            <a className="dropdown-toggle" href="#" data-toggle="dropdown">
              New Event
              <span className="caret"></span>
            </a>
            <div className="dropdown-menu dropdown-wide">
              <form className="form">
                <input type="text" className="form-control" placeholder="Give me a name?" />
                <textarea
                  className="form-control input-medium"
                  rows="7"
                  placeholder="Tell me more about it!"
                >
                </textarea>
                <button type="button" className="btn btn-primary btn-lg pull-right">Create</button>
              </form>
            </div>
          </li>
        </ul>
      );
    } else {
      // Not logged in
      rightHeader = (
        <ul className="nav navbar-nav navbar-right">
          <li>
            <LinkButton
              to="/signin" type="button"
              className="btn btn-success navbar-btn sign-btn"
            >
              Sign in
            </LinkButton>
          </li>
          <li>
            <button type="button" className="btn btn-default navbar-btn sign-btn">Sign up</button>
          </li>
        </ul>
      );
      newBillView = null;
    }

    return (
      <header role="navigation">
        <nav className="navbar navbar-inverse navbar-static-top navbar-no-margin">
          <div className="container-fluid">
            {/* Brand and toggle get grouped for better mobile display */}
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#bs-example-navbar-collapse-1"
                aria-expanded="false"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <Link to="/" className="navbar-brand">ZAbacus</Link>
            </div>
      
            {/* Collect the nav links, forms, and other content for toggling */}
            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
              {newBillView}
              {rightHeader}
            </div>{/* /.navbar-collapse */}
          </div>{/* /.container-fluid */}
        </nav>
      </header>
    );
  }
}