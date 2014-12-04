var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through');
var register_factory = require('./utils.js').register_factory;

module.exports = function Savvy_measurement(URL, PORT) {
	//////////////////////////////////////////////////
	// @priors is an array of (prior) @results
	// @results is an object { key: string, 'clicks': Number, 'impressions': Number }}
	//

	var self = this, M, _port;

  self._scuttlebutt = M = new Model(); // scuttlebut model

  self.writeStream = install_write_stream;

	function install_write_stream(stream) {
		console.log('installing write stream')
		var ms = M.createStream();
		ms.on('error', function() { stream.destroy() });
		stream.on('error', function() { ms.destroy() });
		return stream.pipe(ms).pipe(stream);
	}

	self.readStream = install_read_stream;

	function install_read_stream(stream) {
		console.log('installing read stream')
		var ms = M.createStream();
		ms.on('error', function() { stream.destroy() });
		stream.on('error', function() { ms.destroy() });
		M.on('update', function(data) {
			stream.write(JSON.stringify(data, null, '\t'));
		})
	}

   if(PORT && URL){
     register_factory(URL, PORT)(function(err, _port){
       if (err){
         return console.log(err);
       }
      wss = new WebSocketServer({
        server: http.createServer(function(){}).listen(_port.register('measurement'));
      });
      console.log('Measurement Service Registered @'URL+':'+PORT);
      wss.on('connection', function(ws) {
        console.log("Socket connected")
        var stream = websocket(ws);
        install_write_stream(stream);
      });
    });
  }
	return self;
}
