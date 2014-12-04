
module.exports = Savvy;

function Savvy(port) {
	var self = this,
		_lab, _net;
	self.lab = _lab = require('./lib/lab.js')(require('./lib/measurement.js')());
	self.net = _net = require('./lib/net.js')(_lab);
	if (port){
		_net.listen(port);
	} else {
		self.listen = _net.listen;

	}
	return self
}

