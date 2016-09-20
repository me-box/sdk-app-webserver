import mqtt from 'mqtt';  
import {sendmessage} from './websocket';

let counter = 0;

export default function init(){
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
}
