import { sendmessage } from './websocket';
import net from 'net'
import { savedata } from '../datastore';
import JsonSocket from 'json-socket';


const handleMsg = (data) => {
	try {
		const { type, msg } = data;
		let channel = "";

		switch (type) {
			case "message":
				if (msg.type === "control") {
					console.log("------------> seen an init message <-------------------------");
					if (msg.payload && msg.payload.command === "init") {
						console.log("*** SAVING DATA", JSON.stringify(msg.payload.data, null, 4));
						savedata(msg.payload.data.id, msg.payload.data);
					}
				}
				channel = msg.channel;
				delete (msg.channel);
				sendmessage(msg);//channel, "message", msg);
				break;

			default:
				channel = msg.channel;
				delete (msg.channel);
				sendmessage(msg);//channel, type, msg)
		}
	} catch (err) {
		console.log("error parsing data", data);
	}
}

export default function init() {

	console.log("INITING THE SERVER!");

	var server = net.createServer();

	server.on('connection', function (socket) { //This is a standard net.Socket
		socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
		socket.on('message', function (message) {
			console.log("got a message!!");
			handleMsg(message);
		});
	});

	server.listen(8435, '0.0.0.0');
}