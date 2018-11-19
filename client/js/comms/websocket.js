//import io from 'socket.io-client';
import { newMessage } from '../actions/AppActions';

export default function init(dispatch) {

  //deal with the reverse proxying of container manager by making socket.io path relative
  let pathname = "";

  const paths = window.location.pathname.split("/");

  if (paths.length > 1) {
    if (paths[paths.length - 2] != "") {
      pathname = `/${paths[paths.length - 2]}`;
    }
  }

  console.log("19nov new version of sdk-webserver, creating websocket!");

  console.log(`**---> initing socket with wss://${window.location.host}${pathname}/ui/ws`);

  const socket = new WebSocket(`wss://${window.location.host}${pathname}/ui/ws`);

  socket.onopen = function (evt) {
    console.log(`----> successfully connected to server websocket`);
  };

  socket.onclose = function (evt) {
    console.log("socket close");
    evt.close();
  };

  socket.onerror = function (evt) {
    console.log("websocket ERROR", evt.data);
  };

  socket.onmessage = ((evt) => {
    console.log("[.!] received data", JSON.parse(evt.data));
    dispatch(newMessage(JSON.parse(evt.data)));
  });

};

