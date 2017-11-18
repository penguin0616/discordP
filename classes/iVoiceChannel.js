const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iPermissions = require("./iPermissions.js");

class iVoiceChannel extends iChannel {
	constructor(discord, data, guild) {
		for (var i in data.permission_overwrites) {
			var v = data.permission_overwrites[i];
			
			v.deny = new iPermissions(discord, v.deny, data.type);
			v.allow = new iPermissions(discord, v.allow, data.type);
		}
		
		super(discord, data, guild);
		var lib = this.discord;
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
}

module.exports = iVoiceChannel;