var jstat = require('jstat').j$; 

module.exports = bandit;
function bandit(typ){
	return function (argvs, callback){
		var variants = Array.prototype.slice.call(argvs);
		return variants.map(function sample(v, i){
			return j&[type].sample(v)
		}).reduce(function choose(p, c){
			return c > p ? c : p
		});
	}
}

var p = bandit("poisson");