var async = require('async');

module.exports = Savvy_lab;

function Savvy_lab(measurement) {
//////////////////////////////////////
// @measurement is an instance of Savvy_measurement
// methods poisson and binom take in a key and return 
// a CURRIED FUNCTION, which takes a key and return another curried function
// which takes a callback. In this way the methods can be instantiated
// /called at somepoint and the resulting functions can be 
// called at any point thereafter in the calling code, returning current 
// experiment data at each point

	var self = this;
	self.poisson = run(require('./experiments/poisson_ab.js'));
	self.binom = run(require('./experiments/binom_ab.js'));
	self.observations = measurement;
	function run(expriment) {
		return function run_experiment(key) {
			if (key === 'all') {
				return run_for_all;
			} else {
				return function curried(callback){
					run_for_key.call(null, key, callback);
				}
			}

			function run_for_all(callback) {
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
						function run_for_variants(err) {
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

			function run_for_key(key, callback) {
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