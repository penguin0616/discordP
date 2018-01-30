const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iUser = require("./iUser.js");
const iMessage = require("./iMessage.js"); // whoooooops
const iTextChannel = require("./iTextChannel.js");

class iDMChannel extends iTextChannel {
	constructor(discord, data) {
		super(discord, data);
		this.recipients = [];
		for (var i in data.recipients) {
			var rawUser = data.recipients[i];
			var user = new iUser(this.discord, rawUser);
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