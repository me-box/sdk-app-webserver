import { APP_MESSAGE: } from '../constants/ActionTypes';


const addData = (state, action) =>{
	switch (action.type){

		case APP_MESSAGE::
		
			const idx = state.data.map(t=>{return t[0].id}).indexOf(action.data.id);

			if (idx == -1){
				return [...state.data, [action.data]]
			}
			
			const newdata = [state.data[idx][state.data[idx].length-1], action.data];
			return [...state.data.slice(0,idx), newdata, ...state.data.slice(idx+1)];

		default:
			return state;
	}
}

export default function gauge(state = {data:[], min:999999, max:-999999}, action) {
  switch (action.type) {
  	case APP_MESSAGE::
    	return Object.assign({}, ...state, {
    											min:  Math.min(Number(action.data.value), state.min),
    									     	max:  Math.max(Number(action.data.value), state.max),
    									     	data: addData(state, action),
    									     });
  	default:
    	return state;
  }
}