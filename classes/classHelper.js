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

module.exports.creator = function(id) {
	return id==128259491660562433;
}
module.exports.testBot = function(id) { return id==297923705617514496; }

module.exports.snowflake = function(operand) {
	if (typeof(operand)=='string' || typeof(operand)=='number') return true;
	return false;
}

module.exports.type = function(operand) {
	if (operand == null) return 'null';
	if (Array.isArray(operand)) return 'array';
	return typeof(operand);
}

module.exports.getClass = function(obj) {
	if (module.exports.isSafe(obj)==false) return undefined;
	return obj.class;
}

module.exports.formatURL = function(rawUrl, formats) {
	
	for (var frum in formats) {
		var to = formats[frum];
		rawUrl = rawUrl.replace("{"+frum+"}", to);
	}
	
	return rawUrl
}

module.exports.convertImage = function(image) {
	if (!image || !(image instanceof Buffer)) image = null;
	else {
		const types = {
			0xFFD8FF: "image/jpg",
			0x89504E: "image/png"
		};
		const magic = image.readUIntBE(0, 3);
		const type = types[magic];
		if (!type) image = null;
		else image = `data:${type};base64,` + image.toString("base64");
	}
	return image;
}





