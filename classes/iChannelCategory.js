const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");


class iChannelCategory extends iChannel {
	constructor(data, guild) {
		super(data, guild);
		
	}
}

module.exports = iChannelCategory;