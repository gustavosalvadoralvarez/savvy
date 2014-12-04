var async = require('async');
var service_factory = require('./utils.js').service_factory;
var savvy_measurement = require('./measurement.js');

module.exports = function Savvy_lab(DATA_SRC, URL, PORT) {
	var data_sctructures, measurement, rpc;
  measurement = savvy_measurement(); // Unregistered private instance of measurement
  if (parseInt(DATA_SRC, 10) !== NaN){
    measurement.writeStream(net.connect(DATA_SRC)); // Gather data from tcp connection
  } else if (typeof DATA_SRC.pipe !== 'undefined'){
    measurement.writeStream(DATA_SRC); // Gather data from node Stream
  } else {
    throw new Error("Unsupported DATA_SRC"); // Fail if we cann't get data
  }
	data_sctructures = savvy_utils.data_structures(measurement._model);
	rpc.poisson = experiment_factory(require('./experiments/poisson_ab.js'));
	rpc.binom = experiment_factory(require('./experiments/binom_ab.js'));
	rpc.poissonBandit = experiment_factory(require('./experiments/bandit.js')("gamma"));
	rpc.binomBandit = experiment_factory(require('./experiments/bandit.js')("beta"));

  return service_factory(rpc, URL, PORT)(function(err, air){
    if (err){
     return console.log(err)
    }
    air.connect('lab');
    return air
  });

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
				data_sctructures.results('all',
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
						data_sctructures.results(variant)(callback);
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
}
