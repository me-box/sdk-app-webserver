import { APP_MESSAGE, APP_REMOVED, APP_RESET} from '../constants/ActionTypes';

const addGaugeData = (state, action) =>{
	switch (action.type){

		case APP_MESSAGE:
			const {options, values} = action.data;

			const idx = state.data.map(t=>{return t[0].id}).indexOf(values.id);

			if (idx == -1){
				return [...state.data, [values]]
			}
			
			const newdata = [state.data[idx][state.data[idx].length-1], values];
			return [...state.data.slice(0,idx), newdata, ...state.data.slice(idx+1)];
			
		default:
			return state;
	}
}

const append = (state = {data:[]}, action)=>{
	const {options, values} = action.data;
	return (Object.assign({}, ...state, {data: [...state.data || [], values], options: options, view:action.view, sourceId: action.sourceId, id: action.id, name: action.name}));
}

const replace = (state = {data:{}}, action)=>{
	const {options, values} = action.data;
	return (Object.assign({}, ...state, {data: values, options: options, view: action.view, sourceId: action.sourceId, id:action.id, name:action.name}));
}

const gauge = (state = {data:[], min:999999, max:-999999}, action)=>{
  
  switch (action.type) {
  	case APP_MESSAGE:
  		const {values, options} = action.data;

  		if (values.type === "data"){ //TODO HANDLE INIT TYPES!
    		return Object.assign({}, ...state, {	data: addGaugeData(state, action),
    												options: options,
													view: action.view,
													id: action.id,
													sourceId: action.sourceId,
													name: action.name,
													min:  Math.min(Number(values.x), state.min),
													max:  Math.max(Number(values.x), state.max),
    									    });
    	}
    	return state;
    	
  	default:
    	return state;
  }
}

const indexFor = (data, sourceId)=>{
	for (let i = 0; i < data.length; i++){
		if (data[i].sourceId === sourceId)
			return i;
	}
	return -1;
}



const flatten = (layout)=>{
	return layout.reduce((acc, row)=>{
		return row.reduce((acc, src)=>{
			acc.push(src);
			return acc;
		}, acc);
	}, [])
}

//purge any sources that do not exist in the current layout for this app;
const purge =  (state, action)=>{
	if (!action.layout)
		return state;
		
	const sources = flatten(action.layout);
	
	if (!state[action.id]){
		return state;
	}
	
	return Object.assign({}, state[action.id], {[action.id] : Object.keys(state[action.id]).reduce((acc, srckey)=>{
		if (sources.indexOf(srckey) != -1){
			acc[srckey] = state[action.id][srckey]; //copy across!
		}
		return acc;
	},{})});	
}

const insert = (state, action)=>{
	const currentdata = state[action.id] || {};
	return Object.assign({}, currentdata, {[action.sourceId] : addData(currentdata[action.sourceId], action)});	
}

const addData = (currentdata, action) =>{
	
	if (action.view === "gauge"){
		return gauge(currentdata,action);
	}
	else if (["list", "text", "html", "uibuilder"].indexOf(action.view) !== -1){
		currentdata = currentdata || {};
	  	return replace(currentdata, action);
	}
	else {
		currentdata = currentdata || {};
		return append(currentdata, action);
	}
}

export default function apps(state = {}, action) {
  	switch (action.type) {
	  
	  case APP_RESET:
	  	return {};
	  	
	  case APP_REMOVED:
	  	
	  	return Object.keys(state).reduce((acc, key)=>{
	  		if (key !== action.appId){
	  			acc[key] = state[key];
	  		}
	  		return acc;
	  	},{})
	  
	  
	  //purge any apps that don't exist in layout...
	  
	  case APP_MESSAGE:
	  
	  	
	  	return Object.assign({}, state, {
	  										[action.id] : insert(purge(state, action), action),
	  									});
	  

	  default:
	    return state;
	}
}