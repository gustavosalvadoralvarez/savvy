var Model = require('scuttlebutt/model');
var async = require('async');
var through = require('through')

module.exports = function Savvy_measurement(model) {
	//////////////////////////////////////////////////
	// @priors is an array of (prior) @results
	// @results is an object { key: string, 'clicks': Number, 'impressions': Number }}
	//

	var self = this,
		M, impressions;

	M = model || new Model(); // scuttlebut model

	impressions = function _impression (key) {
		return '!' + key;
	}

	self.KEYS = []; // digest 

	self.set_priors = set_priors;

	function set_priors(priors, callback) {
		if (priors && Array.isArray(priors)) {
			priors.forEach(function _set(prior) {
				create_observation(prior.key, prior);
			})
			callback(null)
		} else {
			callback("Priors must be an array")
		}
	}

	self.observation = create_observation;

	function create_observation(key, prior) {
		prior = prior || {}; //inelegant way to establish multiple arity 
		M.set(impressions(key), prior.impressions || 0); // ! denotes impressions, chosen for its unicode brevity
		M.set(key, prior.clicks || 0);
		self.KEYS.push(key);
	}

	self.results = make_results;

	function make_results(key) {
		if (key === 'all') {
			return _all_results;
		} else {
			return function _curried(next) {
				_results(key, next);
			}
		}

		function _results(key, next) {
			results = {
				'key': key,
				clicks: M.get(impressions(key)),
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
		M.on('update', function(data) {
			stream.write(JSON.stringify(data, null, '\t'));
		})
	}

	return self;
}