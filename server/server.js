import http  from 'http';
import express from 'express';
import bodyparser from 'body-parser';
import websocketinit from './comms/websocket';
import ipcinit from './comms/ipc';

const app = express();
app.use('/', express.static("static"));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

const server = http.createServer(app);
let PORT = 8080

if (process.argv.length > 2){
   PORT = parseInt(process.argv[2]);
}

websocketinit(['databox'],server);
ipcinit();

app.get('/', function(req,res){
  res.render('index');
});

app.use('/comms', require('./routes/comms'));

//redirect any failed routes to root
app.use(function(req,res){
   res.redirect("/");
});

server.listen(PORT);
