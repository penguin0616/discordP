const httpGet = require("./httpGet.js");
const httpPost = require("./httpPost.js");
const endpoints = require("../constants/endpoints.js");

module.exports.post = function(path, postData, callback, onError) {
	let headers = {
		'Content-Type': 'application/json'
	}
	
	var token = require("../main.js").discord().token;
	if (token) headers['Authorization'] = token;
	
	return httpPost({
		url: endpoints.baseUrl + path,
		postData: postData,
		headers: headers
	}, callback, onError)
}

module.exports.get = function(path, callback, onError) {
	let headers = {
		'Content-Type': 'application/json'
	}
	
	var token = require("../main.js").discord().token;
	if (token) headers['Authorization'] = token;
	
	return httpGet({
		url: endpoints.baseUrl + path,
		headers: headers
	}, callback, onError)
}