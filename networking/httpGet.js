const http = require("http");
const https = require("https");

var pattern = /(\w+):\/\/([^/]+)(.*)/   // /(\w+):\/\//


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
		method: 'GET',
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
	options.method = 'GET'
	
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
	req.end();
	
	
	/*
	
	var method = options.hostname.match(pattern);
	options.method = 'GET'
	
	if (d[1]=="http") return http.get(options, (res) => {handleRes(res, callback, onError)});
	if (d[1]=="https") return https.get(options, (res) => {handleRes(res, callback, onError)}); 
	
	throw "Unable to detect a valid method in the hostname.";
	
	*/

}



















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





/*
function handleRes(res, callback, onError) {
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
}
*/







/*
module.exports = function(url, callback, onError) {
	var d = url.match(pattern);
	if (d == null)
		throw "EXPECTED A HTTP OR HTTPS LINK";
	
	if (d[1]=="http")
		return http.get(url, (res) => {handleRes(res, callback, onError)});
	
	if (d[1]=="https")
		return https.get(url, (res) => {handleRes(res, callback, onError)});
	
	throw "HAKS";
}
*/





