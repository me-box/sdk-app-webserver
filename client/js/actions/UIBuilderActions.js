import {networkAccess, networkError, networkSuccess} from './NetworkActions';
import request from 'superagent';
import {UIBUILDER_INIT} from '../constants/ActionTypes';

export function init(nid){
	
	return function (dispatch, getState) {
		console.log("calling fetch channel id");
		dispatch(networkAccess(`requesting channelID`));
		console.log("** calling ./ui/comms/channelID");
		request
		  .get(`./ui/init/${nid}`)
		  .set('Accept', 'application/json')
		  .end(function(err, res){
			if (err){
			  console.log(err);
			  dispatch(networkError(`failed to fetch channelID`));
			}else{
			
			  dispatch(networkSuccess(`successfully received channelID`));
			  dispatch({
			  	type: UIBUILDER_INIT,
			  	data: res.body,
			  };
			}
		 });
	}
}