module.exports = function experiment(counts, callback) {
	// :: [[int/float, int/float],[int/float, int/float]] ==> { prob: float, conclusion: string }
	//     Clicks     Impressions   CLicks    Impressions
	// Calculates tie probability that Poisson process w/ posterior dist. A ~ Gamma(counts[0]) has a higher
	// frequency (lambda) than event B ~ Gamma(counts[1])  
	var log, exp, a1, b1, a2, b2, t1, t2, t3, results = {};
	// stat funcs hacked off (for script size) from jStat:  https://github.com/jstat/jstat
	function gammaln(x) {
		var j = 0,
			cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5],
			ser = 1.000000000190015,
			xx, y, tmp;
		tmp = (y = xx = x) + 5.5;
		tmp -= (xx + 0.5) * Math.log(tmp);
		for (; j < 6; j++)
			ser += cof[j] / ++y;
		return Math.log(2.5066282746310005 * ser / xx) - tmp;
	}

	function betaln(x, y) {
		return gammaln(x) + gammaln(y) - gammaln(x + y)
	}

	// parse input and define locals
	a1 = parseInt(counts[0][0], 10); // hits in 1
	b1 = parseInt(counts[0][1], 10); // impressions in 1
	a2 = parseInt(counts[1][0], 10); // hits in 2
	b2 = parseInt(counts[1][1], 10); // impressions in 2
	log = Math.log;
	exp = Math.exp;
	// evaluate all constants in summation ahead of time
	t1 = log(b1);
	t2 = a2 * log(b2);
	t3 = log(b1 + b2);
	// sum from 0 to the int before a1 ( use logs to avoid hitting Infinity )
	var k = 0,
		t = 0;
	while (k++ < a1) {
		t += exp(k * t1 + t2 - (k + a2) * t3 - log(k + a2) - betaln(k + 1, a2))
	}
	// define results and return
	results.prob = t;
	results.conclusion = "The Probability that Freq1 > Freq2 is " + t;
	callback(null, results);
}


// Comparison to Optimizely sample size recommendations 
/*
var sample = 10316,
	a1 = 0.03*sample, // 3% CTR
	a2 = (1.2)*a1; // Detect a 20% lift in CTR 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.00962823106978439,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.00962823106978439' }
*/

// sample of 500 
/*
var sample = 500,
	a1 = 0.03*sample,
	a2 = (1.2)*a1; 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.36416242575013047,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.36416242575013047' }
*/
// 1000
/*
var sample = 1000,
	a1 = 0.03*sample,
	a2 = (1.2)*a1; 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.2692913876125481,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.2692913876125481' }
*/
// 2000
/*
var sample = 2000,
	a1 = 0.03*sample,
	a2 = (1.2)*a1; 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.16919011946498017,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.16919011946498017' }
*/
// 5000 
/*
var sample = 5000,
	a1 = 0.03*sample,
	a2 = (1.2)*a1; 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.05513039352852019,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.05513039352852019' }
*/
// 7500
/*
var sample = 7500,
	a1 = 0.03*sample,
	a2 = (1.2)*a1; 
console.log(work([[a1, sample], [a2, sample]]))
{ prob: 0.023929162536846654,
  conclusion: 'The Probability that Freq1 > Freq2 is 0.023929162536846654' }
*/