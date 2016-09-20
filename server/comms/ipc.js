import {sendmessage} from './websocket';
import ipc from 'node-ipc'
let counter = 0;

export default function init(){
	
	ipc.config.id   = 'webserver';
    ipc.config.retry= 1500;
 
    ipc.serve(
        function(){
            ipc.server.on(
                'message',
                function(data,socket){
                    //ipc.log('got a message : '.debug, data);
                    const msg = JSON.parse(data.toString());
					console.log(msg);
					const channel = "testApp";//msg.channel; //this is set to the user's github acc name
					delete(msg.channel); 
					sendmessage(channel, "databox", "message", msg)
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
