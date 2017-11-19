module.exports.constants = function() {
	return require("../constants/constants.js");
}

module.exports.endpoints = function() {
	return require("../constants/endpoints.js");
}

module.exports.setHiddenProperty = function(state, name, value) {
	Object.defineProperty(state, name, {value: value, enumerable: false, writable: true, configurable: true})
}

module.exports.clone = function(obj) {
	var newObj = {}
	for (var i in obj) {
		newObj[i] = obj[i];
	}
	return newObj;
}

module.exports.isSafe = function(thingy) {
	var isSafe = false;
	try {
		if (thingy._isDiscordClass==true) {
			isSafe = true;
		}
	} catch (e) {
		isSafe = false;
	}
	return isSafe;
}

module.exports.type = function(operand) {
	if (operand == null) return 'null';
	if (Array.isArray(operand)) return 'array';
	return typeof(operand);
}

module.exports.formatURL = function(rawUrl, formats) {
	
	for (var frum in formats) {
		var to = formats[frum];
		rawUrl = rawUrl.replace("{"+frum+"}", to);
	}
	
	return rawUrl
}






