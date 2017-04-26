import {networkAccess, networkError, networkSuccess} from './NetworkActions';
import request from 'superagent';
import {UIBUILDER_INIT, UIBUILDER_REMOVE_NODE, UIBUILDER_CLONE_NODE, UIBUILDER_UPDATE_NODE_ATTRIBUTE, UIBUILDER_UPDATE_NODE_TRANSFORM, UIBUILDER_UPDATE_NODE_STYLE, UIBUILDER_ADD_MAPPING} from '../constants/ActionTypes';
import {defaultCode, resolvePath} from '../utils/utils';

const _function_for = {

    "attribute"	: updateNodeAttribute,
    
    "transform"	: updateNodeTransform,
    
    "style"		: updateNodeStyle,
}

const _shouldClone = (path, enterKey, nodesByKey)=>{
  const [templateId, ...rest] = path;
  const subkey     = enterKey ? enterKey : "root";
  if (nodesByKey[templateId]){
    if (nodesByKey[templateId][subkey]){
      return false;
    }
  }
  return true;
}

const _getNode = (nodesByKey, nodesById, enterKey, path)=>{
	if (path && path.length >= 1){
		const id 	  = path[path.length-1];
		const key 	  = enterKey || "root";
		const nodeId  = nodesByKey[id] ? nodesByKey[id][key] : null;
		return nodeId ? nodesById[nodeId] : {};
	}
	return {};
}



function removeNode(nodeId, path, enterKey){
 
   return {
      type: UIBUILDER_REMOVE_NODE,
      enterKey,
      nodeId,
      path,
   }
}

function updateNodeAttribute(path:Array, property:string, value, enterKey:string, ts:number, index:number) {
 
  return (dispatch, getState)=>{
    
    //clone this node if we need to
    
    if (_shouldClone(path, enterKey, getState().uibuilder.nodesByKey)){
     
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          enterKey,
          path,
          ts,
          index,
      });
    }

    //update the node
    dispatch({
        type: UIBUILDER_UPDATE_NODE_ATTRIBUTE,
        path,
        property,
        value,
        enterKey,
    });
  };
}

function cloneNode(path:Array, enterKey, index){
  return (dispatch, getState)=>{

    if (_shouldClone(path, enterKey, getState().uibuilder.nodesByKey)){
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          enterKey,
          path,
          ts: Date.now(),
          index,
      });
    }
  }
}

function updateNodeStyle(path:Array, property:string, value, enterKey:string, ts:number, index:number){
  return (dispatch, getState)=>{

    if (_shouldClone(path, enterKey, getState().uibuilder.nodesByKey)){
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          enterKey,
          path,
          ts,
          index,
      });
    }

    dispatch({
      type: UIBUILDER_UPDATE_NODE_STYLE,
      path,
      property,
      value,
      enterKey,
    });
  }
}

function updateNodeTransform(path:Array, property:string, transform:string, enterKey:string, ts:number, index:number){

   return (dispatch, getState)=>{
  
  if (_shouldClone(path, enterKey, getState().uibuilder.nodesByKey)){
      
      //console.log("YES - cloning!");

      dispatch({
          type: UIBUILDER_CLONE_NODE,
          enterKey,
          path,
          ts,
          index,
      });
    }

    dispatch({
        type: UIBUILDER_UPDATE_NODE_TRANSFORM,
        path,
        property,
        transform,
        enterKey,
    });
  }
}


function addMapping(sourceId, map){
	console.log("Adding mapping");
	return {
		type: UIBUILDER_ADD_MAPPING,
		sourceId,
		map,
	}
}


export function init(id){
	
	console.log("OK INIT HAS BEEN CALLED!!!! : " + id);

	return function (dispatch, getState) {
	
		dispatch(networkAccess(`initing`));
		console.log(`** calling ./ui/init/${id}`);
		request
		  .get(`./ui/init/${id}`)
		  .set('Accept', 'application/json')
		  .end(function(err, res){
			if (err){
			  console.log(err);
			  dispatch(networkError(`failed init`));
			}else{
			
			  	dispatch(networkSuccess(`successfully inited!`));
				if (res.body.init){
					const {templates, mappings, transformers} = res.body.init;
					console.log("*******************");
					console.log(JSON.stringify(res.body.init,null,4));
					console.log("*******************");

			  		dispatch({
			  			type: UIBUILDER_INIT,
			  			templates: Object.keys(templates),
			  			templatesById: templates,
			  		});

			  		dispatch(subscribeMappings(mappings, transformers));
				}
			}
		 });
	}
}


export function subscribeMappings(mappings, transformers){

	return (dispatch, getState)=>{
    	
    	const {uibuilder: {nodesByKey, nodesById, templatesById}} = getState();

	    for (let i = 0; i < mappings.length; i++){
	      
	      const fn = _function_for[mappings[i].ttype];
	      
	      if (fn){

	        const onData = (data, count, mapping)=>{
	         

	          const {mappingId, from: {key},  to:{property}} = mapping;
	          const template = templatesById[mapping.to.path[mapping.to.path.length-1]];
	          const value   = resolvePath(mapping.from.key, mapping.from.path, data);
	          
	          let shouldenter = true;
	          let enterKey = null;

	          if (template.enterFn){
	            const {enter,key} = template.enterFn;
	            shouldenter = Function(...enter.params, enter.body)(data,count);
	            enterKey =  Function(...key.params, key.body)(data,count);
	          }
	        
	          const remove   = template.exitFn ?   Function(...template.exitFn.params, template.exitFn.body)(data,count) : null; //template.exitFn(data, count) : false;            
	          const node = _getNode(nodesByKey, nodesById, enterKey, mapping.to.path); 
	          
	          if (remove){
	            dispatch(removeNode(node.id, mapping.to.path, enterKey));
	          }else if (shouldenter){
	            const transformer = transformers[mappingId] || defaultCode(key,property);
	            const transform   = Function(key, "node", "i", transformer);  
	            dispatch(fn(mapping.to.path,property,transform(value, node, count), enterKey, Date.now(), count));
	          }
	        }
	        dispatch(addMapping(mappings[i].from.sourceId, {mapping:mappings[i], onData}))
	      }
	    }
	}
}