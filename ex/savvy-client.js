var dnode = require('dnode');
var net = require('net');

var d = dnode();
d.on('remote', function (remote) {
    var p = remote.poisson('all');
    var datastream = remote.readStream(process.stdout);
    p(console.log);
});

var c = net.connect(process.argv[2]);
c.pipe(d).pipe(c);