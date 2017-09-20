import { APP_INIT, APP_REMOVED, APP_MESSAGE, APP_RESET, DEBUG_MESSAGE,  DEBUG_TOGGLE_PAUSE, BULB_MESSAGE, PIPSTA_MESSAGE } from '../constants/ActionTypes';
import {networkAccess, networkError, networkSuccess} from './NetworkActions';
import request from 'superagent';

const inited = {};


export function appRemoved(appId) {
  return {
    type: APP_REMOVED,
    appId,
  };
}

export function init(id){
  
  return function (dispatch, getState) {
  
    dispatch(networkAccess(`initing`));
    console.log(` UIBUILDER --- calling ./ui/init/${id} -`);
    request
      .get(`./ui/init/${id}`)
      .set('Accept', 'application/json')
      .end(function(err, res){
      if (err){
        console.log(err);
        dispatch(networkError(`failed init`));
      }else{
      
        dispatch(networkSuccess(`successfully inited!`));
        console.log("SUCCESSFUL INIT!");
        console.log(JSON.stringify(res.body,null,4));

        if (res.body.init){
            dispatch({
              type: APP_INIT,
              data: res.body.init,
            });
        }
      }
     });
  }
}

export function newMessage(msg) {

  console.log("new msg");
  if (!msg)
    return;
  
  return function (dispatch, getState) {
  
    if (msg.type === "control" && msg.payload.command==="reset"){
      dispatch({type: APP_RESET})
      return;
    }


    const {sourceId, payload={}} = msg;
    const {id, name, view, data={}} = payload;
  

    if (!inited[id]){
        inited[id] = true;
        dispatch(init(id));
    }

    //TODO - this is a special case for uibuilder -  make standard

    if (view === "uibuilder"){
        const state = getState().uibuilder[sourceId];
       
        if (state && state.mappings){
          const mappings = state.mappings[data.id] || [];
          const tick = state.ticks[data.id] || 0;
          mappings.map((item)=>{
            item.onData(data, tick, item.mapping);
          });
        } 

        dispatch({
          type:UIBUILDER_INCREMENT_TICK,
          dataId: data.id,
          sourceId,
        });
    }

    dispatch({
      type: APP_MESSAGE,
      id,
      sourceId,
      name,
      view,
      data,
    });
  }
}
