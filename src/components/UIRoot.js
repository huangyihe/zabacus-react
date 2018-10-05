import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { UIRootNav } from './UIRootNav';
import { Home } from './Home';
import { SignIn, SignUp } from './SignIn';
import { BillList } from './BillList';

export const hasToken = () => (localStorage.getItem('token') != null);
export const setToken = (jwt) => {
  localStorage.setItem('token', jwt);
};
export const resetToken = () => {
  if (hasToken()) {
    localStorage.removeItem('token');
  }
};

export const UIRoot = () => (
  <div>
    {/* header and nav bar */}
    <UIRootNav />

    <Route exact path="/" render={() => {
      if (hasToken()) {
        return <Redirect to="/bills/list" />;
      } else {
        return <Redirect to="/home" />;
      }
    }}/>
    {/* special view place holder to display home page */}
    <Route exact path="/home" component={Home} />
    
    <div className="container">
    
      {/* main view */}
      <Switch>
        <Route path="/signin" component={SignIn} />
        <Route path="/signup" component={SignUp} />
        <Route
          path="/signout" render={
          () => {
            resetToken();
            return <Redirect to="/" />;
          }
        } />
        <Route path="/bills/list" component={BillList} />
        {/*
        <Route path="/welcome" component={Welcome} />
        <Route path="/error" component={Err} />
        <Route path="/user/:id" component={User} />
        <Route path="/bills/details/:billId" component={BillView} />
        <Route path="/bills/items/:itemId" component={ItemView} />
        */}
      </Switch>
    
      {/* footer */}
      <div className="container container-body">
        <footer className="zabacus-footer">
          <p>Developed and maintained by a small team of lovely people</p>
          <ul className="list-inline zabacus-footer-links">
            <li>About</li>
            <li>&middot;</li>
            <li>GitHub</li>
            <li>&middot;</li>
            <li>API</li>
            <li>&middot;</li>
            <li>Help</li>
            <li>&middot;</li>
            <li>Legacy Site</li>
            <li>&middot;</li>
            <li>Terms</li>
            <li>&middot;</li>
            <li>Contact Us</li>
          </ul>
          <ul className="list-inline zabacus-footer-links">
            <li>&copy; 2015 The ZAbacus Team</li>
            <li>&middot;</li>
            <li>Code licenced under MIT</li>
          </ul>
        </footer>
      </div>
    </div>
  </div>
);