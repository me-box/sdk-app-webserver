import socket from 'socket.io';
let _namespaces = {};
let connected = {};

export default function init(nsps, server){

    const io = socket(server, {path: '/ui'}).listen(server);
  

    nsps.forEach(function(namespace){
      var nsp = io.of('/'+namespace);

      if (!_namespaces[namespace]){

        _namespaces[namespace] = nsp;

        nsp.on('connection', function(socket){

           socket.on('join', function(app){
              console.log("joining client to room" + app);
              socket.join(app);
              //return app; 
          });

          socket.on('leave', function(app){
            console.log("leaving room: " + app);
            socket.leave(app);
          });
      
          socket.on('disconnect', function(){
             console.log("socket disconnect!");
          });

        });
      }
    });
}

export function sendmessages(rooms, namespace, event, message){
  rooms.forEach(function(room){
      console.log(`sending to room ${room} namespace ${namespace}`);
      this.sendmessage(room,namespace,event,message);
  }.bind(this));
  return rooms.length;
};

export function sendmessage(room, namespace, event, message){
      if (_namespaces[namespace]){
        console.log(`sending to room ${room} namespace ${namespace}`);
        _namespaces[namespace].to(room).emit(event, message);
      }
};
