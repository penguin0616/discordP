const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iUser = require("./iUser.js");

class iEmoji extends iBase {
	constructor(discord, data) {
		super(discord, data);
		
		if (data.roles) {
			this.raw_roles = data.roles;
			delete data.roles;
		}
		
		if (data.user) {
			this.user = new iUser(discord, data.user);
			delete data.user;
		}
		
		for (var i in data) this[i] = data[i];
		
		this.translatedName = classHelper.translateEmoji(this.name);
		
	}
}

module.exports = iEmoji;