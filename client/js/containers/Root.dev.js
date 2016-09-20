import React, { Component } from 'react';
import { Provider } from 'react-redux';
import App from './App';
import Apps from './Apps';
import Installer from './Installer';
import AppStore from './AppStore';
import DevTools from './DevTools';
import { IndexRedirect, Router, Route, browserHistory } from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';
import FooterMenu from './FooterMenu';

export default class Root extends Component {
  
  render(){

    const { store } = this.props;
    const history = syncHistoryWithStore(browserHistory, store);
 
    return (
      <Provider store={store}>
        <div>
          <Router history={history}>
              
              <Route path="/" component={App}>
                <Route path="apps" component={Apps}/>
                <Route path="appstore" component={AppStore}>
                   <Route path="/install/:appId" component={Installer}/>
                </Route>
                <IndexRedirect to="apps" />
                <Route path="*" component={Apps}/>
              </Route>
          </Router>
          <DevTools />
        </div>
    
      </Provider>
    );
  }
}

