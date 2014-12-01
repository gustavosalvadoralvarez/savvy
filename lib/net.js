var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var dnode = require('dnode');
var http = require('http');

module.exports = function Savvy_net(lab, ops) {
	var self = this,
		_rpc, observations, poisson, binom;
	poisson = lab.poisson;
	binom = lab.binom;
	observations = lab.observations;
	_rpc = dnode({
		poisson: poisson,
		binom: binom,
		results: observations.results,
		observe: observations.create_observation,
		priors: observations.set_priors,
		digest: function _fetch_digest() {
			var keys = observations.KEYS;
			return function _digest(callback) {
				if (!keys) {
					callback("something went wrong fetching digest")
				} else {
					callback(null, keys)
				}
			}
		},
		sockets: function _fetch_sockets() {
			var sockets = self.sockets;
			return function _sockets(callback) {
				if (!sockets) {
					callback("something went wrong fetching sockets");
				} else {
					callback(null, sockets);
				}
			}
		},
		writeStream: observations.writeStream,
		updateStream: observations.readStream
	});
	self.listen = init_net;
	function init_net(port, callback) {
		var http_server, wss;
		http_server = http.createServer(function() {}).listen(port || ops.port);
		wss = new WebSocketServer({
			server: http_server
		});
		self.sockets = [];
		wss.on('connection', function(ws) {
			console.log("socket connected")
			var ws_stream, obs_stream;
			ws_stream = websocket(ws);
			obs_stream = observations.writeStream(ws_stream)
			self.sockets.push(obs_stream);
		});
		callback();
	}
	self.rpc = pipe_rpc;
	function pipe_rpc(stream) {
		stream.pipe(_rpc).pipe(stream)
	}
	return self
}