import { } from '../constants/ActionTypes';
import { networkAccess, networkError, networkSuccess } from './NetworkActions';
import request from 'superagent';
import init from '../comms/websocket';


export function fetchChannelId() {

	return function (dispatch, getState) {
		console.log("calling fetch channel id");
		dispatch(networkAccess(`requesting channelID`));

		request
			.get(`./ui/comms/channelID`)
			.set('Accept', 'application/json')
			.end(function (err, res) {
				if (err) {
					console.log(err);
					dispatch(networkError(`failed to fetch channelID`));
				} else {
					console.log("successfully received channel ID!");
					dispatch(networkSuccess(`successfully received channelID`));
					console.log("initing web socket!!");
					init(dispatch);
				}
			});
	}
}