const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iPermissions = require("./iPermissions.js");

class iRole extends iBase {
	constructor(discord, data) {
		super(discord, data);
		
		data.permissions = new iPermissions(data.permissions)
		
		
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
	}
	
	
}

module.exports = iRole;




