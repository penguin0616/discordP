const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");


class iChannelCategory extends iChannel {
	constructor(data, guild) {
		super(data, guild);
		
		var lib = classHelper.lib();
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
}

module.exports = iChannelCategory;