const http = require("http");
const https = require("https");

var pattern = /(\w+):\/\/([^/]+)(.*)/





function handleURL(url) {
	if (url == undefined) return "Need a url in some way!"
	let data = url.match(pattern);
	if (data == null) return "URL formatting failed due to not following pattern.";
	var method = data[1];
	var hostname = data[2];
	var path = data[3];
	if (method != 'http' && method != 'https') return "expected http or https"
	
	return {
		method: method,
		hostname: hostname,
		path: path
	}
}



function useHttp(options, handler) {
	var postData = options.postData;
	delete options.postData;
	handleRequest(http.request(options, (res) => {handleResponse(res, handler)}), postData, handler)
}
function useHttps(options, handler) {
	var postData = options.postData;
	delete options.postData;
	handleRequest(https.request(options, (res) => {handleResponse(res, handler)}), postData, handler)
}

function handleRequest(req, postData, handler) {
	req.on('error', (e) => {
		handler(e);
	})
	if (postData) req.write(postData);
	req.end();
}



function handleResponse(res, handler) {
	let rawData = '';
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
		rawData += chunk
	});
	res.on('end', () => {
		handler(undefined, res, rawData);
	});
}

module.exports.get = function(args, handler) {
	var url, headers
	
	if (typeof(args)=='string') url = args
	else if (typeof(args)=='object') { url = args.url; headers = args.headers }
	var ui = handleURL(url)
	
	if (typeof(ui)=='string') return handler(new Error(ui));
	
	var method = ui.method,
		hostname = ui.hostname,
		path = ui.path;
	
	var options = {
		hostname: hostname,
		path: path,
		method: 'GET',
		headers: headers
	}
	
	if (method=='http') useHttp(options, handler);
	if (method=='https') useHttps(options, handler);
}

module.exports.post = function(args, handler) {
	var url, headers, postData
	
	if (typeof(args)=='string') url = args
	else if (typeof(args)=='object') { url = args.url; headers = args.headers; postData = args.postData;}
	var ui = handleURL(url)
	
	if (typeof(ui)=='string') return handler(new Error(ui));
	
	var method = ui.method,
		hostname = ui.hostname,
		path = ui.path;
	
	var options = {
		hostname: hostname,
		path: path,
		method: 'POST',
		headers: headers,
		postData: postData
	}
	
	if (method=='http') useHttp(options, handler);
	if (method=='https') useHttps(options, handler);
}

module.exports.patch = function(args, handler) {
	var url, headers, postData
	
	if (typeof(args)=='string') url = args
	else if (typeof(args)=='object') { url = args.url; headers = args.headers; postData = args.postData;}
	var ui = handleURL(url)
	
	if (typeof(ui)=='string') return handler(new Error(ui));
	
	var method = ui.method,
		hostname = ui.hostname,
		path = ui.path;
	
	var options = {
		hostname: hostname,
		path: path,
		method: 'PATCH',
		headers: headers,
		postData: postData
	}
	
	if (method=='http') useHttp(options, handler);
	if (method=='https') useHttps(options, handler);
}

module.exports.delete = function(args, handler) {
	var url, headers, postData
	
	if (typeof(args)=='string') url = args
	else if (typeof(args)=='object') { url = args.url; headers = args.headers; postData = args.postData;}
	var ui = handleURL(url)
	
	if (typeof(ui)=='string') return handler(new Error(ui));
	
	var method = ui.method,
		hostname = ui.hostname,
		path = ui.path;
	
	var options = {
		hostname: hostname,
		path: path,
		method: 'DELETE',
		headers: headers,
		postData: postData
	}
	
	if (method=='http') useHttp(options, handler);
	if (method=='https') useHttps(options, handler);
}



