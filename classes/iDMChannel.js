const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iUser = require("./iUser.js");


class iDMChannel extends iChannel {
	constructor(data) {
		super(data);
		
		delete this.recipients;
		this.recipients = [];
		for (var i in data.recipients) {
			var rawUser = data.recipients[i];
			var user = new iUser(rawUser);
			this.recipients.push(user);
		}
		
		
	}
	
	get owner() {
		for (var i in this.recipients) {
			var u = this.recipients[i];
			if (u.id == this.owner_id) return u;
		}
	}
}



module.exports = iDMChannel;