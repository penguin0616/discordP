module.exports.discord = function() {
	return require("../main.js").discord();
}
module.exports.lib = function() {
	return require("../main.js");
}

module.exports.constants = function() {
	return require("../constants/constants.js");
}

module.exports.endpoints = function() {
	return require("../constants/endpoints.js");
}

module.exports.setHiddenProperty = function(proto, name, value) {
	var proto = Object.getPrototypeOf(this);
	proto[name] = value
	Object.defineProperties(proto, {
		[name]: {enumerable: false}
	})
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
