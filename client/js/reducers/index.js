import { combineReducers } from 'redux';
import apps from './apps';
import network from './network';
import screen from './screen';
import layout from './layout';
import uibuilder from './uibuilder';

const rootReducer = combineReducers({
  apps,
  layout,
  network,
  screen,
  uibuilder,
});

export default rootReducer;
