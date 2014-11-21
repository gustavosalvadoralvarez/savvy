module.exports = function experiment(counts, callback) {
	var a1, b1, a2, b2, log, exp, results = {};

	function gammaln(x) {
		var j = 0;
		var cof = [
			76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
		];
		var ser = 1.000000000190015;
		var xx, y, tmp;
		tmp = (y = xx = x) + 5.5;
		tmp -= (xx + 0.5) * Math.log(tmp);
		for (; j < 6; j++)
			ser += cof[j] / ++y;
		return Math.log(2.5066282746310005 * ser / xx) - tmp;
	}

	function betaln(x, y) {
		return gammaln(x) + gammaln(y) - gammaln(x + y)
	}

	b1 = 1 + parseInt(counts[0][1], 10);
	b2 = 1 + parseInt(counts[1][1], 10);
	a1 = 1 + parseInt(counts[0][0], 10);
	a2 = 1 + parseInt(counts[1][0], 10);
	t1 = b1 + b2;
	t2 = a2 + b2;
	t3 = betaln(a1, b1);
	log = Math.log;
	exp = Math.exp;
	var k = 0,
		t = 0;
	while (k++ < a2) {
		t += exp(betaln(a1 + k, t1) - log(b1 + k) - betaln(1 + k, b2) - t3)
	}
	results.prob = 1 - t;
	results.conclusion = "The Probability that Proportion1 > Proportion2 is " + (1 - t);
	callback(null, results);
}

