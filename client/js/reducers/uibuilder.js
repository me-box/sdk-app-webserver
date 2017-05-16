import {UIBUILDER_INIT, UIBUILDER_REMOVE_NODE, UIBUILDER_CLONE_NODE, UIBUILDER_UPDATE_NODE_ATTRIBUTE, UIBUILDER_UPDATE_NODE_STYLE, UIBUILDER_UPDATE_NODE_TRANSFORM,UIBUILDER_ADD_MAPPING, APP_MESSAGE} from '../constants/ActionTypes';
import {generateId, scalePreservingOrigin, componentsFromTransform,originForNode} from '../utils/utils';

const initialState = {
  nodes: [],
  nodesByKey: {},
  nodesById: {},
  templatesById: {},
  templates: [],
  mappings: {},     
};

//nce we have all child ids we can then create a lookuo table to map old ids to new, then return all new.
const _getAllChildIds = (template, blueprints)=>{
    if (!template.children)
      return [];

    return [].concat.apply([], template.children.map((child)=>{
        if (blueprints[child].children){
          return [child, ..._getAllChildIds(blueprints[child], blueprints)]
        }
        return child; 
    }));
}

const _createNode = (template, blueprints, ts, index)=>{

    const id = generateId();

    if (template.type !== "group"){
        return {
                  node:  Object.assign({}, template, {id, ts, index, label:`${template.type}:${template.id}`, style: Object.assign({}, template.style)}),
                  children: {},
                  lookup:{},
              }
    }

    const childIds = _getAllChildIds(template, blueprints);
    
    const lookup = childIds.reduce((acc, key)=>{
        acc[key] = generateId();
        return acc;
    },{});

    const children = childIds.reduce((acc, id)=>{
        const newId = lookup[id];
        acc[newId] = Object.assign({}, blueprints[id], {id:newId, ts, index});
        if(acc[newId].children){
            acc[newId].children = acc[newId].children.map((id)=>lookup[id]);
        } 
        return acc;
    },{})

    return  {
        node:  Object.assign({}, template, {
                                                id, 
                                                ts,
                                                index,
                                                children: template.children.map(k=>lookup[k]),
                                                label:`${template.type}:${template.id}`, 
                                                style: Object.assign({}, template.style)
                                            }),
        children,
        lookup,
    }
} 

const _cloneStaticTemplates = (templates, blueprints)=>{
  

    return templates.filter((key)=>{
       return !blueprints[key].enterFn;
    }).reduce((acc, key)=>{
        const {node, children, lookup} = _createNode(blueprints[key], blueprints, Date.now(), 0);
        
        acc.nodes.push(node.id);
        
        acc.nodesById = {...acc.nodesById, ...{[node.id]:node}, ...children};
        
        const nbk = Object.keys(lookup).reduce((acc,key)=>{
                      acc[key] = {root:lookup[key]}
                      return acc;
                    },{});

        acc.nodesByKey = {...acc.nodesByKey, [key]:{root:node.id}, ...nbk};
                           

        return acc;
    },{nodes:[], nodesByKey: {}, nodesById:{}});
}

const _updateNodeAttributes = (state, action)=>{
 
  if (!state.nodesById)
    return state;

  
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = state.nodesByKey[templateId] ? state.nodesByKey[templateId][subkey] : null;

  //should always have a nodeId, as clone node was dispatched first
  if (nodeId){
     const n = Object.assign({}, state.nodesById[nodeId], {[action.property]:action.value});
     return Object.assign({}, state, {nodesById: Object.assign({}, state.nodesById, {[nodeId] : n})});
  }

  return state;
}


const _updateNodeStyles = (state, action)=>{
  
  if (!state.nodesById)
    return state;

  //const [templateId, ...rest] = action.path;
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = state.nodesByKey[templateId] ? state.nodesByKey[templateId][subkey] : null;

  //if we already have an entry for this node and its subkey, then just update it
  if (nodeId){
     const node = state.nodesById[nodeId];
     const style = node.style || {};
     const n = Object.assign({}, state.nodesById[nodeId], {
                                                              style: Object.assign({}, style, {[action.property]:action.value})
                                                           });

     return Object.assign({}, state, {nodesById: Object.assign({}, state.nodesById, {[nodeId] : n})});
  }

  return state;
}

const _updateNodeTransforms = (state, action)=>{
  if (!state.nodesById)
    return state;

  //const [templateId, ...rest] = action.path;
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = state.nodesByKey[templateId] ? state.nodesByKey[templateId][subkey] : null;

  
  //if we already have an entry for this node and its subkey, then just update it
  if (nodeId){
     const transform = _createTransform(state.nodesById[nodeId], action.property, action.transform);
     const n = Object.assign({}, state.nodesById[nodeId], {transform});
     return Object.assign({}, state, {nodesById: Object.assign({}, state.nodesById, {[nodeId] : n})});
  }
  return state;
}

const _cloneNode = (state, action)=>{
    //const [templateId, ...rest] = action.path;
  
    const templateId = action.path[action.path.length-1];
    const subkey     = action.enterKey ? action.enterKey : "root";
    const {node, children, lookup} = _createNode(state.templatesById[templateId], state.templatesById, action.ts, action.index);
    

    const k = Object.assign({}, state.nodesByKey[templateId] || {}, {[subkey]:node.id});

    const nbk = Object.keys(lookup).reduce((acc,key)=>{
                      acc[key] = Object.assign({}, state.nodesByKey[key]||{}, {[subkey]:lookup[key]});
                      return acc;
                },{});


    return Object.assign({}, state, {
                                          nodes: [...state.nodes, node.id],
                                          nodesById:  {...state.nodesById, ...{[node.id]:node}, ...children},
                                          nodesByKey: {...state.nodesByKey, ...{[templateId]: k}, ...nbk},
                                      });

}

const _combine = (newtransform="", oldtransform="")=>{
  
    const {scale, rotate, translate} = Object.assign({}, componentsFromTransform(oldtransform), componentsFromTransform(newtransform));
    const transforms = [];

    if (scale)
      transforms.push(`scale(${scale})`);

    if (translate)
      transforms.push(`translate(${translate})`);

    if (rotate)
      transforms.push(`rotate(${rotate})`);

    return transforms.join();
}

const _createTransform = (node, type, transform)=>{

    
   const {x,y}   =  originForNode(node);

   switch(type){
      
      case "scale":
          const {scale} = componentsFromTransform(transform);
          return _combine(scalePreservingOrigin(x, y, scale || 1), node.transform || "");

      case "translate":
          const {translate} = componentsFromTransform(transform);
          return _combine(`translate(${translate})`,  node.transform || "");

      case "rotate":
          const {rotate} = componentsFromTransform(transform);
          return _combine(`rotate(${rotate},${x},${y})`, node.transform || "")

      default:

   }
}


function viz(state = initialState, action) {
  switch (action.type) {

    case UIBUILDER_INIT:
      const {nodes, nodesById, nodesByKey} = _cloneStaticTemplates(action.templates, action.templatesById);


      const _state = Object.assign({}, state, {
                                                nodes,
                                                nodesById,
                                                nodesByKey,
                                                templates : action.templates,
                                                templatesById: action.templatesById,
                                                canvasdimensions: action.canvasdimensions,
                                              });
      return _state;

  
  case UIBUILDER_REMOVE_NODE:
      
      //WORKS FIRST TIME ROUND BUT FAILS AFTER THAT - IS THE onData function using stale info?

      const templateId = action.path[action.path.length-1];

      const todelete =  [action.nodeId, ..._getAllChildIds(action.nodeId, state.nodesById)];

      return  Object.assign({}, state, {
                                                nodes : state.nodes.filter(nid=>nid!=action.nodeId),
                                                nodesByKey : Object.assign({}, state.nodesByKey, {[templateId] : Object.keys(state.nodesByKey[templateId]).reduce((acc, key)=>{
                                                    const nodeId = state.nodesByKey[templateId][key];
                                                    if (nodeId != action.nodeId){
                                                      acc[key] =  nodeId;
                                                    }
                                                    return acc;
                                                },{})}),
                                                nodesById : Object.keys(state.nodesById).reduce((acc, key)=>{
                                                   if (todelete.indexOf(key) === -1){
                                                      acc[key] = state.nodesById[key];
                                                   }
                                                   return acc;
                                                },{})
                            });

  case UIBUILDER_CLONE_NODE:
      return Object.assign({}, state, _cloneNode(state, action));

  case UIBUILDER_UPDATE_NODE_ATTRIBUTE: 
      return Object.assign({}, state, _updateNodeAttributes(state, action));

  case UIBUILDER_UPDATE_NODE_STYLE: 
      return Object.assign({}, state, _updateNodeStyles(state, action));

  case UIBUILDER_UPDATE_NODE_TRANSFORM:
      return Object.assign({}, state, _updateNodeTransforms(state, action));

  case UIBUILDER_ADD_MAPPING:
      
      const _s =  Object.assign({}, state, {mappings: Object.assign({}, state.mappings, {[action.datasourceId]: [...(state.mappings[action.datasourceId]||[]), action.map]})});
      return _s;

  case APP_MESSAGE:
    //const {id, payload} = action.payload.data;

    //console.log(action.payload.data);
    return state;

  default:
      return state;
  }
}


export default function uibuilder(state = {}, action){
 
  if (action.sourceId){
    return Object.assign({}, state, {[action.sourceId] : viz(state[action.sourceId], action)});
  }
  return state;
}