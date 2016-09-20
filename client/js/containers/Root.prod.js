import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Apps from './Apps';

export default class Root extends Component {
  
  render(){

    const { store } = this.props;
   
    return (
      <Provider store={store}>
          <Apps/>
      </Provider>
    );
  }
}