const classHelper = require('../classes/classHelper.js');
const request = require('./request.js');
const endpoints = require('../constants/endpoints.js');

module.exports = function() {
	var lib = {};
	var token;
	lib.post = function(path, postData, handler) {
		let headers = {
			'Content-Type': 'application/json'
		}
		if (token) headers['Authorization'] = token;
		return request.post({
			url: endpoints.baseUrl + path,
			postData: postData,
			headers: headers
		}, handler)
	}
	lib.get = function(path, handler) {
		let headers = {
			'Content-Type': 'application/json'
		}
		if (token) headers['Authorization'] = token;
		return request.get({
			url: endpoints.baseUrl + path,
			headers: headers
		}, handler)
	}
	lib.patch = function(path, postData, handler) {
		let headers = {
			'Content-Type': 'application/json'
		}
		if (token) headers['Authorization'] = token;
		return request.patch({
			url: endpoints.baseUrl + path,
			postData: postData,
			headers: headers
		}, handler)
	}
	lib.delete = function(path, handler) {
		let headers = {
			'Content-Type': 'application/json'
		}
		if (token) headers['Authorization'] = token;
		return request.delete({
			url: endpoints.baseUrl + path,
			headers: headers
		}, handler)
	}
	lib.put = function(path, handler) {
		let headers = {
			'Content-Type': 'application/json'
		}
		if (token) headers['Authorization'] = token;
		return request.put({
			url: endpoints.baseUrl + path,
			headers: headers
		}, handler)
	}
	lib.updateToken = function(t) { token = t };
	
	return lib;
}

/*

module.exports.post = function(path, postData, handler) {
	let headers = {
		'Content-Type': 'application/json'
	}
	
	var token = classHelper.discord().token;
	if (token) headers['Authorization'] = token;
	
	
	return request.post({
		url: endpoints.baseUrl + path,
		postData: postData,
		headers: headers
	}, handler)
}

module.exports.get = function(path, handler) {
	let headers = {
		'Content-Type': 'application/json'
	}
	var token = classHelper.discord().token;
	if (token) headers['Authorization'] = token;
	
	
	return request.get({
		url: endpoints.baseUrl + path,
		headers: headers
	}, handler)
}

module.exports.patch = function(path, postData, handler) {
	let headers = {
		'Content-Type': 'application/json'
	}
	var token = classHelper.discord().token;
	if (token) headers['Authorization'] = token;
	
	
	return request.patch({
		url: endpoints.baseUrl + path,
		postData: postData,
		headers: headers
	}, handler)
}

module.exports.delete = function(path, handler) {
	let headers = {
		'Content-Type': 'application/json'
	}
	var token = classHelper.discord().token;
	if (token) headers['Authorization'] = token;
	
	
	return request.delete({
		url: endpoints.baseUrl + path,
		headers: headers
	}, handler)
}
module.exports.put = function(path, handler) {
	let headers = {
		'Content-Type': 'application/json'
	}
	var token = classHelper.discord().token;
	if (token) headers['Authorization'] = token;
	

	
	return request.put({
		url: endpoints.baseUrl + path,
		headers: headers
	}, handler)
}

*/