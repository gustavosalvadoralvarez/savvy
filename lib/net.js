var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var dnode = require('dnode');
var http = require('http');
var net = require('net');

module.exports = function Savvy_net(lab) {
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
		digest: fetch_digest,
		clients: fetch_sockets
		observationStream: observation_stream_factory
	});
	self.listen = init_net;
	self.rpc = rpc_pipe;
	return self;
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
		if (callback) {
			callback();
		}
	}

	function fetch_sockets() {
		var sockets = self.sockets;
		return function _sockets(callback) {
			if (!sockets) {
				callback("something went wrong fetching sockets");
			} else {
				callback(null, sockets);
			}
		}
	}

	function fetch_digest() {
		var keys = observations.KEYS;
		return function _digest(callback) {
			if (!keys) {
				callback("something went wrong fetching digest")
			} else {
				callback(null, keys)
			}
		}
	}

	function rpc_pipe(stream) {
		stream.pipe(_rpc).pipe(stream)
	}

	function observation_stream_factory(typ, permissioning){
		var local_stream, transport_stream, init_stream; 
		local_stream = (function (permissioning){
			if (permissioning === "write"){
				return observations.writeStream;
			} else if (permissioning === 'read') {
				return observations.readStream;
			} else {
				return null
			}
		})(permissioning);
		if (!local_stream){
			return function (param, callback){
				callback("Permissioning parameter not supported. \n
				Supported values: 'read', 'write'")
			}
		}
		switch (typ){
			case "tcp":
				transport_stream = net.createServer(function connect_(socket){
					local_stream(socket);
				});
				init_stream = function init_tcp(port, callback) { 
					try {
						transport_stream.listen(port);
					} catch(err){
						return callback(err)
					}	
					callback(null)		
				}
				break;
			case "wss":
				transport_stream = websocket;
				init_stream = function init_wss(wss_url. callback) {
					var socket;
					try {
						socket = transport_stream(wss_url);
						local_stream(socket);
					} catch(err){
						return callback(err)
					}
					callback(null;)
				}
				break; 
			default: 
				return function (param, callback){
					callback("Stream type not supported. \n
					Supported values: 'tcp' => function(port, callback), 'wss' => function(wssURL, callback)")
				}
		}
		return init_stream;
	}
}