import { APP_REMOVED, APP_MESSAGE, APP_RESET } from '../constants/ActionTypes';

export function appRemoved(appId) {
  return {
    type: APP_REMOVED,
    appId,
  };
}
export function newMessage(msg) {
 
  if (!msg)
  	return;

  
  if (msg.type === "control" && msg.payload.command==="reset"){
  	return {
  		type: APP_RESET,
  	}
  }
  
  const {sourceId, payload, layout} = msg;
  const {id, name, view, data} = payload;
  const {options, values} = data;
 
  return {
    type: APP_MESSAGE,
    id,
    sourceId,
    layout,
    name,
    view,
    options,
    values,
  }
}