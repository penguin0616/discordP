const classHelper = require('./classHelper.js');


class iBase {
	constructor(discord, rawData) {
		classHelper.setHiddenProperty(this, '_raw', rawData);
		classHelper.setHiddenProperty(this, '_isDiscordClass', true);
		classHelper.setHiddenProperty(this, 'discord', discord);
	}
}



module.exports = iBase;