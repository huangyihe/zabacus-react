import React from 'react';
import { UIRoot } from '../components/UIRoot';

export class UIRootContainer extends React.Component {
  constructor(props) {
    super(props);

    this.userSignOut = this.userSignOut.bind(this);
    this.userIsAuthenticated = this.userIsAuthenticated.bind(this);

    this.rootController = {
      signOut: this.userSignOut,
      userIsAuthenticated: this.userIsAuthenticated,
    }
  }

  userSignOut() {
    localStorage.removeItem('token');
  }

  userIsAuthenticated() {
    const token = localStorage.getItem('token');
    return (token != null);
  }

  render() {
    return <UIRoot rootControl={this.rootController}/>;
  }
}