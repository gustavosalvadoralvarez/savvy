var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through');
var utils = require('./utils.js');
var net = require('net');

module.exports = function Savvy_measurement(URL, PORT) {
  var self = this, M, _port;
  self._model = M = new Model(); // scuttlebut model
  self.writeStream = install_write_stream;
  self.readStream = install_read_stream;
  self.install_websocket_server = install_websocket_server;
  self.start_service = start_service;
  return self;

  function install_write_stream(stream) {
    console.log('installing write stream')
    var ms = M.createStream();
    ms.on('error', function() { stream.destroy() });
    stream.on('error', function() { ms.destroy() });
    return stream.pipe(ms).pipe(stream);
  }

  function install_read_stream(stream) {
    console.log('installing read stream')
    var ms = M.createStream();
    ms.on('error', function() { stream.destroy() });
    stream.on('error', function() { ms.destroy() });
    M.on('update', function(data) {
      stream.write(JSON.stringify(data, null, '\t'));
    })
  }

  function install_websocket_server(PORT){
    wss = new WebSocketServer({
      server: http.createServer(function(){}).listen(PORT);
    });
    wss.on('connection', function(ws) {
      console.log("Socket connected")
      var stream = websocket(ws);
      install_write_stream(stream);
    });
  }
  if(PORT && URL){
    register_factory(URL, PORT)(function(err, _port){
      if (err){
        return console.log(err);
      }
      install_websocket_server(_port.register('measurement-ws-server'));
    });
  }

  function start_service(AIRPORT_URL, AIRPORT_PORT){
    var SERVICES = {
      tcp_readStream: net.createServer(function(socket){
        install_read_stream(socket);
      }).listen,
      tcp_writeStream: net.createServer(function(socket){
        install_write_stream(socket);
      }).listen,
      ws_server: install_websocket_server
    };
    return utils.service_factory(SERVICES, AIRPORT_URL, AIRPORT_PORT)(_connect);
    function _connect(err, service){
      if (err){
        return console.log("Something went wrong initiallizing measurement rpc service");
      }
      service.connect('measurement-rpc-service');
    }
  }
}
