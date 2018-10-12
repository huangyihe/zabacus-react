import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from "react-apollo";
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { UIRoot } from './components/UIRoot';

let serverHost;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  serverHost = 'http://localhost:8000';
} else {
  serverHost = 'https://api.zabacus.org';
}

const httpLink = createHttpLink({
  uri: `${serverHost}/graphql/`,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      authorization: token ? `JWT ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

class ZAbacus extends Component {
  render() {
    return (
      <ApolloProvider client={client} >
        <Router>
          <UIRoot />
        </Router>
      </ApolloProvider>
    );
  }
}

export default ZAbacus;
