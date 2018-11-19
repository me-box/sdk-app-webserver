import { APP_MESSAGE, APP_REMOVED, APP_RESET } from '../constants/ActionTypes';

const addGaugeData = (state, action) => {
	switch (action.type) {

		case APP_MESSAGE:
			const { options, values } = action.data;

			const idx = state.data.map(t => { return t[0].id }).indexOf(values.id);

			if (idx == -1) {
				return [...state.data, [values]]
			}

			const newdata = [state.data[idx][state.data[idx].length - 1], values];
			return [...state.data.slice(0, idx), newdata, ...state.data.slice(idx + 1)];

		default:
			return state;
	}
}

const append = (state = { data: [] }, action) => {
	const { options = {}, values } = action.data;
	const { view, sourceId, id, name } = action;

	//return (Object.assign({}, ...state, {data: [...state.data || [], values], options: options, view:action.view, sourceId: action.sourceId, id: action.id, name: action.name}));

	return {
		...state,
		data: options.maxreadings ? [...state.data || [], values].slice(-options.maxreadings) : [...state.data || [], values],
		options,
		view,
		sourceId,
		id,
		name,
	}
}

const replace = (state = { data: {} }, action) => {
	const { options, values } = action.data;
	return {
		...state,
		data: values,
		options: options,
		view: action.view,
		sourceId: action.sourceId,
		id: action.id,
		name: action.name
	};
}

const gauge = (state = { data: [], min: 999999, max: -999999 }, action) => {

	switch (action.type) {
		case APP_MESSAGE:
			const { values, options } = action.data;

			if (values.type === "data") {
				return {
					...state,
					data: addGaugeData(state, action),
					options: options,
					view: action.view,
					id: action.id,
					sourceId: action.sourceId,
					name: action.name,
					min: Math.min(Number(values.x), state.min),
					max: Math.max(Number(values.x), state.max),
				};
			}
			return state;

		default:
			return state;
	}
}

const flatten = (layout) => {
	return layout.reduce((acc, row) => {
		return row.reduce((acc, src) => {
			acc.push(src);
			return acc;
		}, acc);
	}, [])
}

//purge any sources that do not exist in the current layout for this app;
const purge = (state, action) => {
	if (!action.layout)
		return state;

	const sources = flatten(action.layout);

	if (!state[action.id]) {
		return state;
	}

	return {
		...state[action.id],
		[action.id]: Object.keys(state[action.id]).reduce((acc, srckey) => {
			if (sources.indexOf(srckey) != -1) {
				acc[srckey] = state[action.id][srckey]; //copy across!
			}
			return acc;
		}, {})
	};
}

const insert = (state, action) => {

	const currentdata = state[action.id] || {};

	return {
		...currentdata,
		[action.sourceId]: addData(currentdata[action.sourceId], action)
	}
}

const addData = (currentdata, action) => {

	console.log("in add data with data", action.data, " and view ", action.view);

	if (action.view === "gauge") {
		return gauge(currentdata, action);
	}
	else if (["list", "text", "html", "uibuilder"].indexOf(action.view) !== -1) {
		console.log("calling replace");
		currentdata = currentdata || {};
		return replace(currentdata, action);
	}
	else {
		console.log("calling append!!");
		currentdata = currentdata || {};
		return append(currentdata, action);
	}
}

export default function apps(state = {}, action) {
	switch (action.type) {

		case APP_RESET:
			return {};

		case APP_REMOVED:

			return Object.keys(state).reduce((acc, key) => {
				if (key !== action.appId) {
					acc[key] = state[key];
				}
				return acc;
			}, {})

		case APP_MESSAGE:

			return {
				...state,
				[action.id]: insert(purge(state, action), action),
			};

		default:
			return state;
	}
}