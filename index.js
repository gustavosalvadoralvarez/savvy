var measurement = require('./lib/measurement.js');
var lab = require('./lib/lab.js');

module.exports = function Savvy(state){
	var self = this, _lab, net;
	self.lab = _lab = lab(measurement(state));

	self.install = function install(server){
		self.net = net = require('./lib/net')(server, self.lab);
		return self;
	}
	return self
}