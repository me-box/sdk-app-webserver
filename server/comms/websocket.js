import * as WebSocket from "ws";

export default class Sender {

  constructor(server) {

    this.ws = null;

    const wss = new WebSocket.Server({ server, path: "/ui/ws" });

    //assume only ever one client!
    wss.on("connection", (_ws) => {
      this.ws = _ws;
      console.log("******************* created websocket!");
    });
  }

  sendmessage(message) {
    console.log("ws: sending message", message);
    if (this.ws != null) {
      try {
        this.ws.send(message);
      } catch (err) {
        console.log("websocket, error sending", err);
      }
    } else {
      console.log("not sending, ws not set up!");
    }
  }
}

/*
//TODO: are we ok to use the same namespace for all apps? (i.e. currently 'databox')
export default function init(namespace, server) {
  console.log("*************** initing websocket!! *************");


  console.log("done!");
  /*console.log("******** server, in init");

  const io = socket({ path: "/ui/socket.io" }).listen(server);

  console.log("*********** server: joining", '/' + namespace)

  _nsp = io.of('/' + namespace);

  _nsp.on('connection', function (socket) {

    socket.on('join', function (app) {
      console.log("--------------------- seen a join request, joining client to room ", app);
      socket.join(app);
      //return app; 
    });

    socket.on('leave', function (app) {
      console.log("leaving room: " + app);
      socket.leave(app);
    });

    socket.on('disconnect', function () {
      console.log("webserver seen socket disconnect!");
    });

  });
}


export function sendmessages(rooms, namespace, event, message) {
  rooms.forEach(function (room) {
    this.sendmessage(room, namespace, event, message);
  }.bind(this));
  return rooms.length;
};

export function sendmessage(message) {
  console.log("sending message", message);
  try {
    ws.send(message);
  } catch (err) {
    console.log("websocket, error sending", err);
  }
  //if (_nsp) {
  //  _nsp.to(room).emit(event, message);
  //} else {
  //  console.log("not sending message, socket.io not setup");
  // }
};
*/