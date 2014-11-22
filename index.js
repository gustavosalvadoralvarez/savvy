
module.exports = Savvy;

function Savvy(server) {
	var self = this,
		_lab, _net;
	self.lab = _lab = require('./lib/lab.js')(require('./lib/measurement.js')());
	(function install(server) {
		self.net = _net = require('./lib/net.js')(server, _lab);
		return self;
	})(server);
	return self
}
/*
var PORT = process.argv[2];
if (PORT) {
	var httpServer = require('http').createServer(function(req, res) {}).listen(PORT, function(err) {
		if (err) {
			console.log(err);
		}
		console.log('server listening on port ' + PORT)
	});
	var savvy = Savvy(httpServer);
	var lab = savvy.lab;
	var header_experiment = lab.poisson('header');
}
*/