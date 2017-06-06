import {networkAccess, networkError, networkSuccess} from './NetworkActions';
import request from 'superagent';
import {UIBUILDER_INIT, UIBUILDER_PROVENANCE, UIBUILDER_PROVENANCE_SELECT_MAPPING, UIBUILDER_RECORD_PATH, UIBUILDER_REMOVE_NODE, UIBUILDER_CLONE_NODE, UIBUILDER_UPDATE_NODE_ATTRIBUTE, UIBUILDER_UPDATE_NODE_TRANSFORM, UIBUILDER_UPDATE_NODE_STYLE, UIBUILDER_ADD_MAPPING} from '../constants/ActionTypes';
import {defaultCode, resolvePath} from '../utils/utils';
import {hierarchy, tree as d3tree} from 'd3-hierarchy';
import {TREEPADDING, TREEMARGIN} from '../constants/ViewConstants';

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

function recordPath(sourceId, mappingId, datasourceId, data, result){
  return {
    type: UIBUILDER_RECORD_PATH,
    sourceId,
    mappingId,
    datasourceId,
    data,
    result,
  }
}

export function selectMapping(sourceId, mapping){
   return {
    type: UIBUILDER_PROVENANCE_SELECT_MAPPING,
    sourceId,
    mapping,
  }
}

export function init(id){
	
	console.log("OK INIT HAS BEEN CALLED!!!! : " + id);

	return function (dispatch, getState) {
	
		dispatch(networkAccess(`initing`));
		console.log(`** calling ./ui/init/${id}`);
		request
		  .get(`/ui/init/${id}`)
		  .set('Accept', 'application/json')
		  .end(function(err, res){
			if (err){
			  console.log(err);
			  dispatch(networkError(`failed init`));
			}else{
			
			  dispatch(networkSuccess(`successfully inited!`));
				console.log(res.body);

				if (res.body.init){
					const {templates, mappings, transformers, canvasdimensions, tree} = res.body.init;

			  		dispatch({
			  			type: UIBUILDER_INIT,
              			sourceId: id,
			  			templates: _parenttemplates(templates),
			  			templatesById: templates,
              			canvasdimensions,
              			tree,
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
	            dispatch(removeNode(sourceId, node.id, mapping.to.path, enterKey));
              return;
              //unsubscribe this mapping?
	          }else if (shouldenter){
	            const transformer = transformers[mappingId] || defaultCode(key,property);
	            const transform   = Function(key, "node", "i", transformer)(value, node, count);  

	            dispatch(fn(sourceId, mapping.to.path,property,transform, enterKey, Date.now(), count));
              	dispatch(recordPath(sourceId, mappingId, mapping.from.sourceId, data.msg._path, transform));
	          }
	        }
	        dispatch(addMapping(sourceId, mappings[i].from.sourceId, {mapping:mappings[i], onData}))
	      }
	    }
	}
}

const _hexDecode = (hex)=>{
    if (!hex){
      return '';
    }

    var j;
    var hexes = hex.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

const _flip = (node, h)=>{

    if (node.children){
     
      return Object.assign({}, node, {
                                          y: h - node.y,
                                          data: Object.assign({}, node.data, {node: Object.assign({}, node.data.node, {unicode:_hexDecode(node.data.node.unicode)})}),
                                          children: node.children.map((child)=>{
                                            return _flip(child, h);
                                          })
                        });
    }
    return Object.assign({}, node, {
                                      y: h - node.y,
                                      data: Object.assign({}, node.data, {node: Object.assign({}, node.data.node, {unicode:_hexDecode(node.data.node.unicode)})})
                                    });
}

export function nodeClicked(sourceId, tid){

  
  return (dispatch, getState)=>{
    const {mappings,nodesByKey,nodesById,tree} = getState().uibuilder[sourceId];
    
    //
    //  TODO:need to create a lookup table here as this is very inefficient (it finds the node id of the item that relates to this template 
    //  - there could be many but only need one, since they are all derived from the same data path.
    

    const nid = Object.keys(nodesByKey).reduce((acc, key)=>{
        const node = nodesByKey[key];
        if (Object.keys(node).map(k=>node[k]).filter((item)=>item===tid).length > 0){
          acc = key;
        }
        return acc;
    },null);

    
    const mappingIds = Object.keys(mappings).reduce((acc, key)=>{
      const item = mappings[key];
      
      //add sourceId
      
      item.forEach((m)=>{
         if (m.mapping.to.path.indexOf(nid) != -1){
            acc.push({mappingId: m.mapping.mappingId, sourceId: m.mapping.from.sourceId});
          }
      });
      
      return acc;
    },[]);

    if (mappingIds.length <= 0){
      dispatch ({
        type: UIBUILDER_PROVENANCE,
        sourceId,
        trees: null,
      })
    }
    else{
      //get all provenance trees!

      //const forestheight = getState().screen.dimensions.h - (mappingIds.length * TREEPADDING) - TREEMARGIN;
      //const treeheight    = forestheight / mappingIds.length; 
      const treeheight = getState().screen.dimensions.h * 0.6 - TREEMARGIN;

      const trees = mappingIds.map((item)=>{
        
          const _tree = {node: {category:"result"}, parents:[tree[item.mappingId]]};
          const h = hierarchy(_tree, (d)=>d.parents);
          const layout = d3tree().size([500, treeheight])(h);

          return{
            mappingId: item.mappingId,
            sourceId: item.sourceId,
            //sourceId
            tree: _flip(layout, treeheight),
          }
      });
     
      dispatch ({
        type: UIBUILDER_PROVENANCE,
        sourceId,
        trees: trees,
      })
    }
  }
}


