const classHelper = require('../classes/classHelper.js');
const request = require('./request.js');
const endpoints = require('../constants/endpoints.js');

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

/*
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
*/