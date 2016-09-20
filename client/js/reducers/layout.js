import { APP_MESSAGE, APP_REMOVED, APP_RESET } from '../constants/ActionTypes';

export default function layout(state = null, action) {
  	switch (action.type) {
	  
	  case APP_REMOVED:
	  	return Object.keys(state).reduce((acc, key)=>{
	  		if (key !== action.appId){
	  			acc[key] = state[key];
	  		}
	  		return acc;
	  	},{})
	  	
	  case APP_RESET:
	  	return null;
	  	
	  case APP_MESSAGE:
	  	if (action.layout){
	  		return  Object.assign({}, state, {[action.id]:action.layout});
	  	}
	  	return state;								
	  
	  default:
	    return state;
	}
}

