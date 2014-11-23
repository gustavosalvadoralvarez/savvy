var WebSocketServer = require('ws').Server
var websocket = require('websocket-stream');
var dnode = require('dnode');
var http = require('http');

module.exports = function Savvy_net(lab, ops) {
	var self = this,
		_rpc;
	_rpc = dnode({
		poisson: lab.poisson,
		binom: lab.binom,
		results: lab.observations.results,
		observe: lab.observations.create_observation,
		priors: lab.observations.set_priors,
		digest: function _get_digest() {
			var keys = lab.observations.KEYS;
			return function _digest(callback) {
				if (!keys) {
					callback("something went wrong fetching digest")
				} else {
					callback(null, keys)
				}
			}
		},
		sockets: function _get_sockets() {
			var sockets = self.sockets;
			return function _sockets(callback) {
				if (!sockets) {
					callback("something went wrong fetching sockets");
				} else {
					callback(null, sockets);
				}
			}
		},
		writeStream: lab.observations.writeStream,
		updateStream: lab.observations.readStream
	})
	self.listen = function init(port, callback) {
		var http_server, wss;
		http_server = http.createServer(function() {}).listen(port || ops.port);
		wss = new WebSocketServer({
			server: http_server
		});
		self.sockets = [];
		wss.on('connection', function(ws) {
			console.log("socket connected")
			var stream = websocket(ws);
			var lab_stream = lab.observations.writeStream(stream)
			self.sockets.push(lab_stream);
		});
		callback();
	}
	self.rpc = function(stream) {
		stream.pipe(_rpc).pipe(stream)
	}
	return self
}