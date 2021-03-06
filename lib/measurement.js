var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through')

module.exports = function Savvy_measurement(priors, model) {
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
		return M.createStream();
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
		var ikey = key + '!';
		M.set(ikey, prior.impressions || 0); // ! denotes impressions, chosen for its unicode brevity
		M.set(key, prior.clicks || 0);
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
			var ikey = key + '!',
			results = {
				'key': key,
				clicks: M.get(ikey),
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
		console.log('installing write stream')
		var ms = M.createStream();
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
		console.log('installing read stream')
		var ms = M.createStream();
		ms.on('error', function() {
			stream.destroy()
		})
		stream.on('error', function() {
			ms.destroy()
		});
		M.on('update', function(data){
			console.log('UPDATED')

			stream.write(JSON.stringify(data));
		})
	}

	return self;
}