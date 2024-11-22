import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import Router from './router';
import App from './App';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

//redux 

import { Provider } from 'react-redux'
import { store } from './redux/store'
import { GoogleOAuthProvider } from "@react-oauth/google";


// const client = new ApolloClient({
//   uri: ' process.env.REACT_APP_API_URLgraphql', // Your backend GraphQL endpoint
//   cache: new InMemoryCache(),
// });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <ApolloProvider client={client}>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="129610006350-hv6hhjvj0vbn2j04mvaaln1gg5drt5qv.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </Provider>
  // </ApolloProvider>
  // ReactDOM.render(

  //     <App />

  //   document.getElementById('root')
);
