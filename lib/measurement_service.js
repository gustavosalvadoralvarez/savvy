var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through');
var service_factory = require('./utils.js').service_factory;
var net = require('net');

module.exports = function measurement_service_factory (AIRPORT_URL, AIRPORT_PORT){
  var NAME = 'measurement_service@'+AIRPORT_URL+':'+AIRPORT_PORT;
  var MODEL = new Model(); // scuttlebut model
  var SERVICES = {
    connect:
    tcp_server: function (){
      return net.createServer(function(socket){
          install_write_stream(socket);
        });
    },
    websocket_server: install_websocket_server
  };
  return service_factory(SERVICES, AIRPORT_URL, AIRPORT_PORT)(register);
  function register(err, service){
    if (err){
      return console.log("Something went wrong initiallizing measurement rpc service");
    }
    service.connect('measurement-service');
  }
  function connect_tcp(port, mode, callback){
    var stream, msg;
    stream = net.connect(port);
    msg = { message: NAME + ": Initialized "+mode+' connection @:'+port };
      switch(mode){
        case "write":
          install_write_stream(stream);port
          callback(null, msg);
          break;
        case "read":
          install_read_stream(stream);
          callback(null, msg);
          break;
        default:
          callback({error:
      }

    },
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
}
