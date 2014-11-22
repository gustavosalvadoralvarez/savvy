var http = require('http');
var fs = require('fs')

var PORT = process.argv[2]

var httpServer = http.createServer(function server_example(req, res) {
	var url = req.url;
	if (RegExp('^/[^/]*$').test(url)) {
		var now, variant 
		now = new Date().getTime();
		variant = parseInt(now, 10)%2 === 0 ? 'A':'B';
		console.log(now)
		console.log(variant)
		res.setHeader("Content-Type", 'text/html');
		res.statusCode = 200;
		fs.createReadStream('./static/pages/sample' + variant + '.html').pipe(res)
	} else if (RegExp(/^\/static\/(.*)/).test(url)) {
		var loc = '.' + url,
			content_type;
		switch (url.split('/static/')[1].split('/')[0]) { // e.g pages in /static/pages/foo/bar.html => 
			case 'css':
				content_type = "text/css";
				break; // [/static/, /pages/foo/bar.html] => [pages, foo, bar.html]
			case 'js':
				content_type = "text/javascript";
				break;
			case 'img':
				content_type = "image/" + path.extname(url);
				break;
			case 'pages':
				content_type = "text/html";
				break;
			default:
				content_type = "text/plain";
		}
		res.setHeader("Content-Type", content_type);
		fs.stat(loc, function send_static(err, stat) {
			if (err) return console.log(err);
			if (stat.isFile()) {
				res.statusCode = 200;
				fs.createReadStream(loc).pipe(res)
			} else {
				res.statusCode = 404;
				res.end("404 NOT FOUND")
			}
		})
	}
}).listen(PORT, function(err) {
	if (err) {
		console.log(err);
	}
	console.log('server listening on port ' + PORT)
});

var savvy = require('../index.js')(httpServer);

var lab = savvy.lab;

lab.observations.readStream(process.stdout);