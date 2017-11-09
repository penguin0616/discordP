const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iPermissions = require("./iPermissions.js");

class iVoiceChannel extends iChannel {
	constructor(data, guild) {
		for (var i in data.permission_overwrites) {
			var v = data.permission_overwrites[i];
			
			v.deny = new iPermissions(v.deny, data.type);
			v.allow = new iPermissions(v.allow, data.type);
		}
		
		super(data, guild);
		var lib = classHelper.lib();
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
}

module.exports = iVoiceChannel;