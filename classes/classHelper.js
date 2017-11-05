module.exports.setHiddenProperty = function(proto, name, value) {
	var proto = Object.getPrototypeOf(this);
	proto[name] = value
	Object.defineProperties(proto, {
		[name]: {enumerable: false}
	})
}

module.exports.discord = function() {
	return require("../main.js").discord();
}
module.exports.lib = function() {
	return require("../main.js");
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