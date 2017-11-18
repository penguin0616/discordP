const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");


class iChannelCategory extends iChannel {
	constructor(discord, data, guild) {
		super(discord, data, guild);
		
		var lib = this.discord;
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
}

module.exports = iChannelCategory;