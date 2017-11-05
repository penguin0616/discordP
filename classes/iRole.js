const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iRole extends iBase {
	constructor(data) {
		super(data);
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
	}
	
	
}

module.exports = iRole;




