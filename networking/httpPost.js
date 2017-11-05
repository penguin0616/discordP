const http = require("http");
const https = require("https");

/*
function newHttpRequest(url, callback, onError) {
	http.get(url, (res) => {
		const statusCode = res.statusCode;
		const contentType = res.headers['content-type'];

		let error;
		if (statusCode !== 200) {
		error = new Error(`Request Failed.\n` +
			`Status Code: ${statusCode}`);
		}
		if (error) {
			res.resume();
			if (onError) return onError(error);
			throw error;
		}
		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => rawData += chunk);
		res.on('end', () => {
			callback(rawData);
		});
	}).on('error', (e) => {
		throw e;
	});
}
*/

var pattern = /(\w+):\/\/([^/]+)(.*)/



function handleRes(res, callback, onError) {
	let rawData = '';
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
		rawData += chunk
	});
	res.on('end', () => {
		callback(rawData)
	});
}


module.exports = function(options, callback, onError) {
	/*
	var options = {
		hostname: d[2],
		//port: 80,
		method: 'POST',
		path: d[3],
		headers: content.headers
	};
	*/
	
	var method;
	
	if (options.url) { // format it
		let url = options.url;
		options.url = undefined;
		
		let data = url.match(pattern);
		if (data == null) throw "URL formatting failed due to not following pattern.";
		method = data[1];
		options.hostname = data[2];
		options.path = data[3];
		
	}
	
	var postData = options.postData;
	
	options.postData = undefined;
	options.method = 'POST'
	
	if (method == undefined) {
		let data = options.hostname.match(pattern);
		if (data == null) throw "URL formatting failed due to not following pattern (2).";
		options.hostname = options.hostname.replace(pattern, function(match, p1, p2, p3, offset, string) {
			method = p1;
			return p2
		})
	}
	
	let req = ((method=="http" && http.request(options, (res) => {handleRes(res, callback, onError)})) || (method=="https" && https.request(options, (res) => {handleRes(res, callback, onError)})))
	
	if (req == undefined) throw "Unable to detect a valid method in the hostname.";
	
	
	req.on('error', (e) => {
		if (onError) return onError(e);
		throw e;
	})
	req.write(postData);
	req.end();
}





/*
	headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(content.postData)
		}
	*/
	
/*

module.exports = function(url, content, callback, onError) {
	var d = url.match(pattern);
	if (d == null)
		throw "EXPECTED A HTTP OR HTTPS LINK";
	
	if (content.headers == undefined) {
		content.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(content.postData)
		}
	}
	var options = {
		hostname: d[2],
		//port: 80,
		method: 'POST',
		path: d[3],
		headers: content.headers
	};
	
	let send = function() {
		if (d[1]=="http")
			return http.request(options, (res) => {handleRes(res, callback, onError)})
		if (d[1]=="https")
			return https.request(options, (res) => {handleRes(res, callback, onError)})
		
		throw "OHNOOO"
	}
	
	const req = send();
	
	req.on('error', (e) => {
		onError(e);
	})
	
	req.write(content.postData);
	req.end();
	
	
}


*/





