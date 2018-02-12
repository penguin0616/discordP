const fs = require('fs');
const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iCollection extends iBase {
	constructor(discord) {
		super(discord);
	}

	find(test) {
		for (var i in this) {
			if (test(this[i])) return this[i]
		}
	}
}

module.exports = iCollection;