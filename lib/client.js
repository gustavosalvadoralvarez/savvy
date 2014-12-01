var Model = require('scuttlebutt/model');
var websocket = require('websocket-stream');

var experiments = new Model();

var ws = websocket(document.URL || 'ws://localhost:4000');
ws.pipe(experiments.createStream()).pipe(ws)

ws.socket.addEventListener('open', function init() {
	var experiment_els = Array.prototype.slice.call(document.querySelectorAll('.savvy'), 0);
	experiment_els.forEach(function _init_el(el, i, arr) {
		var exp_data, exp_key, set_impression, imp_key;
		exp_data = JSON.parse(el.getAttribute('data-experiment'));
		exp_key = exp_data.id + exp_data.variant; // weve chosen to lable experiements by id and variant arbitrarirly 
		imp_key = exp_key + '!';
		el.addEventListener('click', function _set_counter() {
			var count = experiments.get(exp_key);
			if (!count) {
				count = 0;
			}
			++count;
			experiments.set(exp_key, count);
		});
		set_impression = function _set_impression(tried) {
			var impressions = experiments.get(imp_key);
			console.log(impressions)
			if (tried && !impressions) {
				impressions = 0;
			} else if (!impressions){
				var nxt_try = set_impression.bind(null, true);
				setTimeout(nxt_try, 3000);
				return 
			}
			console.log("setting impressions")
			++impressions;
			console.log(impressions)
			experiments.set(imp_key, impressions);
		}
		setTimeout(set_impression, 3000) // to prevent miscounting bounces + protocol convergence errors
	})
})