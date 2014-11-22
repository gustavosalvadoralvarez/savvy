var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream');

module.exports = function Savvy_net(httpServer, lab) {
	var self = this,
		wss;
	console.log(httpServer)
	wss = new WebSocketServer({
		server: httpServer
	});
	self.sockets = [];
	wss.on('connection', function(ws) {
		console.log("socket connected")
		var stream = websocket(ws);
		var lab_stream = lab.observations.writeStream(stream)
		self.sockets.push(lab_stream);
	})
	return self
}