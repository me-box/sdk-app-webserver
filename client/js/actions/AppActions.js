import { APP_REMOVED, APP_MESSAGE, APP_RESET } from '../constants/ActionTypes';

export function appRemoved(appId) {
  return {
    type: APP_REMOVED,
    appId,
  };
}

//TODO - reduce overloading of app message - things like layout/options etc should be set during the inital init (see uibuilder)
export function newMessage(msg) {
  
  if (!msg)
    return;
  
  return function (dispatch, getState) {
  
    if (msg.type === "control" && msg.payload.command==="reset"){
      dispatch({type: APP_RESET})
      return;
    }

    const {sourceId, payload={}, layout} = msg;
    const {id, name, view, data={}} = payload;


    //TODO - this is a special case for uibuilder - not to make standard

    if (view === "uibuilder"){
        const mappings = getState().uibuilder.mappings[data.id] || [];
        mappings.map((item)=>{
          item.onData({msg:data}, 0, item.mapping);
        }); 
    }

    dispatch({
      type: APP_MESSAGE,
      id,
      sourceId,
      layout,
      name,
      view,
      data,
    });
  }
}