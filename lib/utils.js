var seaport = require('seaport');
var airport = require('airport');

module.ports.register_factory = function register_factory (SEAPORT_URL, SEAPORT_PORT){
  return function register_service(callback){
    var port;
    if (!(SEAPORT_URL && SEAPORT_PORT)){
      return callback("Must provide SEAPORT_URL && SEAPORT_PORT");
    }
    console.log('Registering service' + service +'@'+SEAPORT_URL+';'+SEAPORT_PORT);
    port = seaport.connect(SEAPORT_URL, SEAPORT_PORT);
    callback(null, port);
  }
}

module.exports.service_factory = function service_factory(SERVICES, AIRPORT_URL, AIRPORT_PORT){
  return function(callback){
    if (!(SERVICES && AIRPORT_URL && AIRPORT_PORT)){
      return callback("Must provide SERVICES && AIRPORT_URL && AIRPORT_PORT");
    }
    callback(null, airport(AIRPORT_URL, AIRPORT_PORT)(obj_to_airfn(SERVICES)))
  }
  function obj_to_airfn(obj){
    var fn, k;
    fn = function(remote, conn){};
    for (k in obj){
      fn[k] = obj[k];
    }
    return fn;
  }
}

module.exports.data_structures = function mk_data(scuttlebutt){
  var self = this;
  self.results_factory = results_factory;
  function results_factory (key) {
    if (key === 'all') { return _all_results;
                       } else { return function _curried(next) {
                         _results(key, next);
                       }
                              }

    function _results(key, next) {
      results = {
        'key': key,
        clicks: scuttlebutt.get(impressions(key)),
        impressions: scuttlebutt.get(key)
      }
      if (results) { next.bind(null, null, results);
                   } else { next.bind(null, 'results not found');
                          }
      process.nextTick(next);
    }

    function _all_results(next) {
      async.map(self.KEYS,
                function _get_results(key, callback) {
                  make_results(key)(callback)
                }, next)
    }
  }
  self.create_observation = create_observation;
  function create_observation(key, prior) {
    prior = prior || {}; //inelegant way to establish multiple arity
    scuttlebutt.set(impressions(key), prior.impressions || 0); // ! denotes impressions, chosen for its unicode brevity
    scuttlebutt.set(key, prior.clicks || 0);
  }

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

  function impressions(key) {
    return '!' + key;
  }
  return self;
}