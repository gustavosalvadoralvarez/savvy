var make_lab = require('./lib/lab.js');
var make_net = require('./lib/net');

module.exports = function Savvy(){
	var self = this, lab, net;
	self.lab = lab = make_lab();

	self.install = function install(server){
		self.net = net = make_net(server, self.lab);
		return self;
	}

}