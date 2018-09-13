/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ws2 = __webpack_require__(9);

var WebSocket = _interopRequireWildcard(_ws2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sender = function () {
  function Sender(server) {
    var _this = this;

    _classCallCheck(this, Sender);

    this.ws = null;

    var wss = new WebSocket.Server({ server: server, path: "/ui/ws" });

    //assume only ever one client!
    wss.on("connection", function (_ws) {
      _this.ws = _ws;
      console.log("created websocket!");
    });
  }

  _createClass(Sender, [{
    key: "sendmessage",
    value: function sendmessage(message) {
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
  }]);

  return Sender;
}();

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


exports.default = Sender;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.savedata = savedata;
exports.lookup = lookup;
exports.printstorage = printstorage;
var store = {};

function savedata(id, data) {
	console.log("saving data!");
	store[id] = data;
}

function lookup(id) {
	return store[id];
}

function printstorage() {
	console.log(JSON.stringify(store, null, 4));
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _https = __webpack_require__(4);

var _https2 = _interopRequireDefault(_https);

var _http = __webpack_require__(5);

var _http2 = _interopRequireDefault(_http);

var _express = __webpack_require__(6);

var _express2 = _interopRequireDefault(_express);

var _bodyParser = __webpack_require__(7);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _ipc = __webpack_require__(8);

var _ipc2 = _interopRequireDefault(_ipc);

var _datastore = __webpack_require__(1);

var _nodeDatabox = __webpack_require__(12);

var _nodeDatabox2 = _interopRequireDefault(_nodeDatabox);

var _websocket = __webpack_require__(0);

var _websocket2 = _interopRequireDefault(_websocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("getting credentials");
var credentials = _nodeDatabox2.default.getHttpsCredentials();
console.log("got credentials", credentials);
var app = (0, _express2.default)();

//var HTTPS_SERVER_CERT = process.env.HTTPS_SERVER_CERT || '';
//var HTTPS_SERVER_PRIVATE_KEY = process.env.HTTPS_SERVER_PRIVATE_KEY || '';


//var credentials = {
//	 key:  HTTPS_SERVER_PRIVATE_KEY,
//	 cert: HTTPS_SERVER_CERT,
//};

app.use('/', _express2.default.static("static"));
app.set('view engine', 'html');
app.engine('html', __webpack_require__(13).renderFile);

var server = _https2.default.createServer(credentials, app);

var PORT = 8080;

if (process.argv.length > 2) {
  PORT = parseInt(process.argv[2]);
}

console.log("initing websockets");
//websocketinit('databox', server);
var sender = new _websocket2.default(server);
console.log("initing ipc");
(0, _ipc2.default)(sender);

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/ui/comms/channelID', function (req, res) {
  console.log("seen an incoming comms request!!");
  res.send({ channelID: 'webapp' });
});

app.get('/ui/init/:id', function (req, res) {

  console.log("seen an init for id " + req.params.id);
  var result = (0, _datastore.lookup)(req.params.id);

  if (result) {
    res.send({ success: true, init: result });
  } else {
    res.send({ success: false });
  }
});

app.get('/ui', function (req, res) {
  console.log("seen a call to ui, sending back index!");
  res.render('index');
});

//redirect any failed routes to root
app.use(function (req, res) {
  console.log("failed route - redirecting to /");
  res.redirect("/");
});

console.log("STARTING SERVER AND LISTENING ON PORT " + PORT);
server.listen(PORT);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = listen;

var _websocket = __webpack_require__(0);

var _net = __webpack_require__(10);

var _net2 = _interopRequireDefault(_net);

var _datastore = __webpack_require__(1);

var _jsonSocket = __webpack_require__(11);

var _jsonSocket2 = _interopRequireDefault(_jsonSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*const handleMsg = (data) => {

	console.log("handling message", data);

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
				//channel = msg.payload.channel;
				//delete (msg.payload.channel);
				sendmessage(msg);//channel, "message", msg);
				break;

			default:
				//channel = msg.payload.channel;
				//delete (msg.payload.channel);
				sendmessage(msg);//channel, type, msg)
		}
	} catch (err) {
		console.log("error parsing data", data);
		console.log(err);
	}
}*/

function listen(sender) {

	console.log("INITING THE IPC SERVER!");

	var server = _net2.default.createServer();

	server.on('connection', function (socket) {
		//This is a standard net.Socket
		socket = new _jsonSocket2.default(socket); //Now we've decorated the net.Socket to be a JsonSocket
		socket.on('message', function (data) {
			console.log("ipc: got a message!!");
			var type = data.type,
			    msg = data.msg;

			sender.sendmessage(data);
			//handleMsg(message);
		});
	});

	server.listen(8435, '0.0.0.0');
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("ws");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("json-socket");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("node-databox");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("ejs");

/***/ })
/******/ ]);