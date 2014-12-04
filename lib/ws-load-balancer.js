var seaport = require('seaport');
var WebSocketServer = require('ws').Server;
var websocket = require('websocket-stream');
var savvy_utils = require('./utils.js);

   savvy_utils.register_factory(URL, PORT)(function(err, _port){
       if (err){
         return console.log(err);
       }
      wss = new WebSocketServer({
        server: http.createServer(function(){}).listen(_port.register('ws-balancer'));
      });
      console.log('Measurement Service Registered @'URL+':'+PORT);
      wss.on('connection', function(ws) {
        console.log("Socket connected")
        var stream = websocket(ws);
        install_write_stream(stream);
      });
    });