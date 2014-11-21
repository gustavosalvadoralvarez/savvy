var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream');

module.exports = function Savvy_net(server, lab){
	var self = this, wss;
	self.wss = wss = new WebSocketServer({'server': server});
	self.sockets = [];
	wss.on('connection', function(ws) {
	  var stream = websocket(ws);
	  self.sockets.push(lab.writeStream(stream));
	})
	return self
}
