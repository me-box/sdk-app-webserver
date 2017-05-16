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
  if (!nodesByKey)
    return false;

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



const _parenttemplates = (templatesById)=>{
  
    const templates = Object.keys(templatesById);

    const children = templates.reduce((acc, key)=>{
        const template = templatesById[key];
        if (template.children){
          acc = [...acc, ...template.children];
        }
        return acc;
    },[]);

    return templates.filter((id)=>{
      return children.indexOf(id) == -1;
    });
}

function removeNode(sourceId, nodeId, path, enterKey){
  
   return {
      type: UIBUILDER_REMOVE_NODE,
      sourceId,
      enterKey,
      nodeId,
      path,
   }
}

function updateNodeAttribute(sourceId:number, path:Array, property:string, value, enterKey:string, ts:number, index:number) {
  
  return (dispatch, getState)=>{
    
    //clone this node if we need to
    if (_shouldClone(path, enterKey,  (getState().uibuilder[sourceId] || {}).nodesByKey)){
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          sourceId,
          enterKey,
          path,
          ts,
          index,
      });
    }

    //update the node
    dispatch({
        type: UIBUILDER_UPDATE_NODE_ATTRIBUTE,
        sourceId,
        path,
        property,
        value,
        enterKey,
    });
  };
}

function cloneNode(sourceId:number, path:Array, enterKey, index){
 
  return (dispatch, getState)=>{

    if (_shouldClone(path, enterKey,  (getState().uibuilder[sourceId] || {}).nodesByKey)){
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          sourceId,
          enterKey,
          path,
          ts: Date.now(),
          index,
      });
    }
  }
}

function updateNodeStyle(sourceId:number, path:Array, property:string, value, enterKey:string, ts:number, index:number){

  return (dispatch, getState)=>{

    if (_shouldClone(path, enterKey, (getState().uibuilder[sourceId] || {}).nodesByKey)){
      dispatch({
          type: UIBUILDER_CLONE_NODE,
          sourceId,
          enterKey,
          path,
          ts,
          index,
      });
    }

    dispatch({
      type: UIBUILDER_UPDATE_NODE_STYLE,
      sourceId,
      path,
      property,
      value,
      enterKey,
    });
  }
}

function updateNodeTransform(sourceId:number, path:Array, property:string, transform:string, enterKey:string, ts:number, index:number){


  return (dispatch, getState)=>{
  
  if (_shouldClone(path, enterKey,  (getState().uibuilder[sourceId] || {}).nodesByKey)){
      
      //console.log("YES - cloning!");

      dispatch({
          type: UIBUILDER_CLONE_NODE,
          sourceId,
          enterKey,
          path,
          ts,
          index,
      });
    }

    dispatch({
        type: UIBUILDER_UPDATE_NODE_TRANSFORM,
        sourceId,
        path,
        property,
        transform,
        enterKey,
    });
  }
}



function addMapping(sourceId, datasourceId, map){
	return {
		type: UIBUILDER_ADD_MAPPING,
		sourceId,
    	datasourceId,
		map,
	}
}

export function init(id){
	
	console.log(`in uibuilder init`);

	return function (dispatch, getState) {
	
		dispatch(networkAccess(`initing`));
		console.log(`uibuilder: calling ./ui/init/${id}`);
		request
		  .get(`./ui/init/${id}`)
		  .set('Accept', 'application/json')
		  .end(function(err, res){
			if (err){
			  console.log(err);
			  dispatch(networkError(`failed init`));
			}else{
			
			  	dispatch(networkSuccess(`successfully inited!`));
				console.log("uibuilder: init response")
				console.log(JSON.stringify(res.body,null,4));

				if (res.body.init){
					const {templates, mappings, transformers, canvasdimensions} = res.body.init;

			  		dispatch({
			  			type: UIBUILDER_INIT,
              			sourceId: id,
			  			templates: _parenttemplates(templates),
			  			templatesById: templates,
              			canvasdimensions,
			  		});

			  		dispatch(subscribeMappings(id, mappings, transformers));
				}
			}
		 });
	}
}


export function subscribeMappings(sourceId, mappings, transformers){

	return (dispatch, getState)=>{
    	
    	
	    for (let i = 0; i < mappings.length; i++){
	      
	      const fn = _function_for[mappings[i].ttype];
	      
	      if (fn){

	        const onData = (data, count, mapping)=>{
	         
            const {nodesByKey={}, nodesById={}, templatesById={}} = getState().uibuilder[sourceId];
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
	          
	          if (remove && node.id){
              console.log("REMOVING NODE!!! " + node.id);
	            dispatch(removeNode(sourceId, node.id, mapping.to.path, enterKey));
              return;
              //unsubscribe this mapping?
	          }else if (shouldenter){
              console.log("CREATING NODE ");
	            const transformer = transformers[mappingId] || defaultCode(key,property);
	            const transform   = Function(key, "node", "i", transformer);  
	            dispatch(fn(sourceId, mapping.to.path,property,transform(value, node, count), enterKey, Date.now(), count));
	          }
	        }
	        dispatch(addMapping(sourceId, mappings[i].from.sourceId, {mapping:mappings[i], onData}))
	      }
	    }
	}
}
