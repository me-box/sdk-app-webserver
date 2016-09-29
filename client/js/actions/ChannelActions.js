import {  } from '../constants/ActionTypes';
import {networkAccess, networkError, networkSuccess} from './NetworkActions';
import request from 'superagent';
import init from '../comms/websocket';


export function fetchChannelId(){
	
	return function (dispatch, getState) {
		console.log("calling fetch channel id");
		dispatch(networkAccess(`requesting channelID`));
		request
		  .get(`./comms/channelID`)
		  .set('Accept', 'application/json')
		  .end(function(err, res){
			if (err){
			  console.log(err);
			  dispatch(networkError(`failed to fetch channelID`));
			}else{
			
			  dispatch(networkSuccess(`successfully received channelID`));
			  init("databox",res.body.channelID, dispatch);
			}
		 });
	}
}