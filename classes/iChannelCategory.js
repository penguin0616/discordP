const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");


class iChannelCategory extends iChannel {
	constructor(discord, data, guild) {
		super(discord, data, guild);
		
		var lib = this.discord;
		if (lib.channels[this.id]==undefined) lib.channels[this.id] = this;
	}
}

module.exports = iChannelCategory;