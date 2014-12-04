var async = require('async');

module.exports = Savvy_lab;

function Savvy_lab(measurement) {
	//////////////////////////////////////
	// @measurement is an instance of Savvy_measurement
	// methods poisson and binom take in a key and return 
	// a CURRIED FUNCTION, which takes a callback. In this way the methods can be instantiated
	// lexically once and the resulting functions can be 
	// called at any point thereafter at run time continiously, with multiple continuations
	// returning current experiment data each time

	var self = this, _bandit;
	self.poisson = experiment_factory(require('./experiments/poisson_ab.js'));
	self.binom = experiment_factory(require('./experiments/binom_ab.js'));
	_bandit = require('./experiments/bandit.js');
	self.bandits = {
		poisson: experiment_factory(_bandit("gamma")),
		binom: experiment_factory(_bandit("beta"))
	}; 
	self.observations = measurement;

	function experiment_factory(expriment) {
		return function experiment_factory_experiment(key) {
			if (key === 'all') {
				return experiment_factory_for_all;
			} else if (Array.isArray(key)) {
				return function experiment_factory_async(callback) {
					async.map(key, experiment_factory_for_key, callback);
				}
			} else {
				return function curried(callback) {
					experiment_factory_for_key(key, callback);
				}
			}

			function experiment_factory_for_all(callback) {
				measurement.results('all',
					function process_variants(err, resultlist) {
						if (err) {
							return callback(err)
						}
						var accumulator = {};
						async.each(
							resultlist,
							function group_variants(result, callback) {
								var key, val, count_key, variant;
								key = result.key;
								count_key = accumulator[key] = accumulator[key] || {};
								variant = key.charAt(key.length - 1);
								count_key[variant] = [result.clicks, result.impressions];
								callback();
							},
							function experiment_factory_for_variants(err) {
								var exp_results = {},
									key;
								for (key in accumulator) {
									exp_results[key] = experiment([
										accumulator[key]['A'],
										accumulator[key]['B']
									]);
								}
								callback(null, expt_results)
							})
					})
			}

			function experiment_factory_for_key(key, callback) {
				var variants = [key + 'A', key + 'B'];
				async.map(variants,
					function get(variant, callback) {
						measurement.results(variant)(callback);
					},
					function process_results(err, results) {
						if (err) {
							return callback(err);
						}
						experiment(results.map(function m(variant_res) {
							return [variant_res.clicks, variant_res.impressions]
						}), callback);
					})
			}
		}
	}
	return self;
}