var savvy = require('../index.js')(4000);
var net = require('net');
var dnode = require('dnode');

net.createServer(function (socket){
	console.log("Savvy connected");
	savvy.net.rpc(socket); 
}).listen(process.argv[2]);

var lab = savvy.lab;

lab.observations.readStream(process.stdout);