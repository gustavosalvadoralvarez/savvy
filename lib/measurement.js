var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through')

module.exports = function Savvy_measurement(priors) {
	//////////////////////////////////////////////////
	// @priors is an array of @results
	// @results is an object { key: { 'clicks': Number, 'impressions': Number }}
	//
	//
	//
	//
	var self = this,
		M, throughstream;

	M = model || new Model(); // scuttlebut model

	throughstream = function throughstream() {
		return self.M.createStream({
			writable: false,
			sendClock: true
		});
	}

	self.KEYS = []; // digest 

	if (priors && Array.isArray(priors)) {
		priors.forEach(function _set(prior) {
			var key = Object.keys(prior)[0];
			create_observation(key, prior[key]);
		})
	}

	self.observation = create_observation;

	function create_observation(key, prior) {
		M.set(key + '!', prior.clicks || 0); // ! denotes clicks, chosen for its unicode brevity
		M.set(key, prior.impressions || 0);
		self.KEYS.push(key);
	}

	self.results = make_results;

	function make_results(key) {
		if (key === 'all') {
			return _all_results;
		} else {
			return _results.bind(key);
		}

		function _results(next) {
			var results = {
				'key': key,
				clicks: M.get(key + '!'),
				impressions: M.get(key)
			}
			if (results) {
				next.bind(null, null, results)
			} else {
				next.bind(null, 'results not found')
			}
			process.nextTick(next);
		}

		function _all_results(next) {
			async.map(self.KEYS,
				function _get_results(key, callback) {
					make_results(key)(callback)
				},
				next)
		}
	}

	self.writeStream = install_write_stream;

	function install_write_stream(stream) {
		var ms = throughstream();
		ms.on('error', function() {
			stream.destroy()
		})
		stream.on('error', function() {
			ms.destroy()
		})
		return stream.pipe(ms).pipe(stream);
	}

	self.readStream = install_read_stream;

	function install_read_stream(stream) {
		var ms = throughstream();
		ms.on('error', function() {
			stream.destroy()
		})
		return ms.pipe(stream);
	}

	return self;
}