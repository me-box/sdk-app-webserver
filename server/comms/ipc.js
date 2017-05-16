import {sendmessage} from './websocket';
import {savedata, printstorage} from '../datastore';
import ipc from 'node-ipc'
let counter = 0;

export default function init(){
	
	ipc.config.id   = 'webserver';
    ipc.config.retry= 1500;
 	ipc.config.silent = true;

    ipc.serve(
        function(){
            ipc.server.on(
                'message',
                function(data,socket){
                	
                    //ipc.log('got a message : '.debug, data);
                    try{
	                    const msg = JSON.parse(data.toString());
						
						if (msg.type && msg.type==="control"){
							if (msg.payload && msg.payload.command === "init"){
								console.log("saving");
								console.log(msg.payload.data.id);
								console.log(msg.payload.data);

								savedata(msg.payload.data.id, msg.payload.data);
								printstorage();
							}
						}

						const channel = "testApp";//msg.channel; //this is set to the user's github acc name
						delete(msg.channel); 
						sendmessage(channel, "databox", "message", msg)
					}
					catch(error){
						console.log(error);
					}
                    /*ipc.server.emit(
                        socket,
                        'message',  //this can be anything you want so long as 
                                    //your client knows. 
                        data+' world!'
                    );*/
                }
            );
        }
    );
 
    ipc.server.start();
}

/*export default function init(){
	const client = mqtt.connect('mqtt://localhost:1883')
	
	client.on('connect', () => {  
  		client.subscribe('webapp')
	})

	client.on('message', (topic, message) => {  

		try {
			const msg = JSON.parse(message.toString());
			console.log(msg);
			const channel = "testApp";//msg.channel; //this is set to the user's github acc name
			delete(msg.channel); 
			sendmessage(channel, "databox", "message", msg)
		}
		catch(err){
			console.log(err);
		}
	});
}*/
