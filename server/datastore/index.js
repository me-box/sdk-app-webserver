const store = {};

export function	savedata(id, data){
	console.log("saving data!");
	store[id]= data;
}

export function lookup(id){
	return store[id];
}

export function printstorage(){
	console.log(JSON.stringify(store,null,4));
}

