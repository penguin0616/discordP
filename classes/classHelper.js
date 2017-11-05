module.exports.setHiddenProperty = function(proto, name, value) {
	var proto = Object.getPrototypeOf(this);
	proto[name] = value
	Object.defineProperties(proto, {
		[name]: {enumerable: false}
	})
}