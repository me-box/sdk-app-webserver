import { combineReducers } from 'redux';
import apps from './apps';
import network from './network';
import screen from './screen';
import layout from './layout';

const rootReducer = combineReducers({
  apps,
  layout,
  network,
  screen,
});

export default rootReducer;
