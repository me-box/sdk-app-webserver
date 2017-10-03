import {UIBUILDER_PROVENANCE, UIBUILDER_PROVENANCE_SELECT_MAPPING, UIBUILDER_RECORD_PATH, UIBUILDER_INCREMENT_TICK, UIBUILDER_INIT, UIBUILDER_REMOVE_NODE, UIBUILDER_CLONE_NODE,UIBUILDER_CLONE_NODE_WITH_STYLE, UIBUILDER_CLONE_NODE_WITH_ATTRIBUTE, UIBUILDER_CLONE_NODE_WITH_TRANSFORM,UIBUILDER_UPDATE_NODE_ATTRIBUTE, UIBUILDER_UPDATE_NODE_STYLE, UIBUILDER_UPDATE_NODE_TRANSFORM,UIBUILDER_ADD_MAPPING, APP_MESSAGE} from '../constants/ActionTypes';
import {generateId, scalePreservingOrigin, componentsFromTransform,originForNode} from '../utils/utils';

const initialState = {
  nodes: [],
  nodesByKey: {},
  nodesById: {},
  templatesById: {},
  templates: [],
  mappings: {}, 
  ticks : {},
  canvasdimensions: {w:1, h:1},  
  tree: {},  
  provenance: [],
  datapath: {},
  selectedMapping: null,
  selectedSource: null,
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

const _updateNodeAttributes = (nodesByKey, nodesById, action)=>{
 
  if (!nodesById)
    return {};

  
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = nodesByKey[templateId] ? nodesByKey[templateId][subkey] : null;

  //should always have a nodeId, as clone node was dispatched first
  if (nodeId){
     const n =  {
                  ...nodesById[nodeId], 
                  [action.property]:action.value
                }

     return {[nodeId] : n}
  }

  return {};
}

const _updateNodeStyles = (nodesByKey, nodesById, action)=>{
  
  if (!nodesById)
    return {};

  //const [templateId, ...rest] = action.path;
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = nodesByKey[templateId] ? nodesByKey[templateId][subkey] : null;

  //if we already have an entry for this node and its subkey, then just update it
  if (nodeId){
     const node = nodesById[nodeId];
     
     const style = node.style || {};
     
     const n =  {
                  ...nodesById[nodeId], 
                  style: {
                        ...style, 
                        [action.property]:action.value
                  }
                }

     return {[nodeId] : n}
  }
  return {};
}

const _updateNodeTransforms = (nodesByKey, nodesById, action)=>{
  if (!nodesById)
    return {};

  //const [templateId, ...rest] = action.path;
  const templateId = action.path[action.path.length-1];
  const subkey     = action.enterKey ? action.enterKey : "root";
  const nodeId     = nodesByKey[templateId] ? nodesByKey[templateId][subkey] : null;

  
  //if we already have an entry for this node and its subkey, then just update it
  if (nodeId){
     const transform = _createTransform(nodesById[nodeId], action.property, action.transform);
     
     const n = {  
                  ...nodesById[nodeId], 
                  transform:transform,
               };

     return   {[nodeId] : n}
  }

  return {};
}

const _cloneNode = (state, action)=>{
    //const [templateId, ...rest] = action.path;
  
    const templateId = action.path[action.path.length-1];
    const subkey     = action.enterKey ? action.enterKey : "root";
    const {node, children, lookup} = _createNode(state.templatesById[templateId], state.templatesById, action.ts, action.index);
    

    const k = {
                ...state.nodesByKey[templateId] || {}, 
                [subkey]:node.id
              };

    const nbk = Object.keys(lookup).reduce((acc,key)=>{
                      acc[key] = {
                                    ...state.nodesByKey[key]||{}, 
                                    [subkey]:lookup[key]
                                  };
                      return acc;
                },{});


    return  {
      nodes: [...state.nodes, node.id],
      
      nodesById:  {
                    ...state.nodesById, 
                    [node.id]:node, 
                    ...children
                  },

      nodesByKey: {
                    ...state.nodesByKey, 
                    [templateId]: k, 
                    ...nbk
                  },
    }
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
                                                tree: action.tree,
                                              });
      return _state;
  
  case UIBUILDER_REMOVE_NODE:
      

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

  //clone and update style all in one go.
  case  UIBUILDER_CLONE_NODE_WITH_STYLE:
      const _stylecloned = _cloneNode(state, action);
      return {
          ...state,
          ..._stylecloned,
          nodesById:{
            ..._stylecloned.nodesById,
            ..._updateNodeStyles(_stylecloned.nodesByKey, _stylecloned.nodesById, action)
          }
      }
      return state;
  
  //clone and update attributes all in one go.
  case  UIBUILDER_CLONE_NODE_WITH_ATTRIBUTE:
      const _attrcloned = _cloneNode(state, action);
      return {
          ...state,
          ..._attrcloned,
          nodesById:{
            ..._attrcloned.nodesById,
            ..._updateNodeAttributes(_attrcloned.nodesByKey, _attrcloned.nodesById, action)
          }
      }
      return state;

  //clone and update transform all in one go.
  case  UIBUILDER_CLONE_NODE_WITH_TRANSFORM:
      const _transformcloned = _cloneNode(state, action);
      return {
          ...state,
          ..._transformcloned,
          nodesById:{
            ..._transformcloned.nodesById,
            ..._updateNodeTransforms(_transformcloned.nodesByKey, _transformcloned.nodesById, action)
          }
      }
      return state;


  case UIBUILDER_CLONE_NODE:
     
      return  {
                ...state, 
                ..._cloneNode(state, action)
              };

  case UIBUILDER_UPDATE_NODE_ATTRIBUTE: 
      return  { 
                ...state, 
                nodesById: {
                    ...state.nodesById, 
                    ..._updateNodeAttributes(state.nodesByKey, state.nodesById, action)
                }
              };

  case UIBUILDER_UPDATE_NODE_STYLE: 
      return {
                ...state, 
                nodesById:{
                   ...state.nodesById,
                   ..._updateNodeStyles(state.nodesByKey, state.nodesById, action)
                }
              };


  case UIBUILDER_UPDATE_NODE_TRANSFORM:
      return {  
                ...state, 
                nodesById:{
                  ...state.nodesById,
                  ..._updateNodeTransforms(state.nodesByKey, state.nodesById, action)
                }
              };

  case UIBUILDER_ADD_MAPPING:     
      return  {
                ...state, 
                mappings: {
                    ...state.mappings, 
                    [action.datasourceId]: [...(state.mappings[action.datasourceId]||[]), action.map]     
                }
              };

  case UIBUILDER_PROVENANCE:

      const selectedMapping  = action.trees && action.trees[0]  ? action.trees[0].mappingId : null;
      const selectedSource   = action.trees && action.trees[0]  ? action.trees[0].sourceId : null;
      
      return {
                ...state,
                provenance:action.trees, 
                selectedMapping: {mappingId: selectedMapping, sourceId: selectedSource},
             };

  case UIBUILDER_PROVENANCE_SELECT_MAPPING:
      return {
                ...state,
                selectedMapping: {mappingId: action.mapping.mappingId, sourceId: action.mapping.sourceId}
             }


  //record by mapping id so that the paths taken to create this mapping are not lost when new data comes in.
  case UIBUILDER_RECORD_PATH:
      
      const result = state.datapath[action.datasourceId] ? state.datapath[action.datasourceId].result || {} : {};

      return { 
              ...state, 
              datapath : {
                ...state.datapath, 
                [action.datasourceId]:{  
                  path: action.data, 
                  result:{
                    ...result,
                    [action.mappingId]: action.result,
                  }
                }
              }
            }

  case UIBUILDER_INCREMENT_TICK:
  
      return {
          ...state,
          ticks : {
            ...state.ticks,
            [action.dataId]: state.ticks[action.dataId] ?  state.ticks[action.dataId] + 1 : 1,
          }
      }

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