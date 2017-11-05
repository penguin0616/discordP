const classHelper = require('./classHelper.js');


class iBase {
	constructor(rawData) {
		classHelper.setHiddenProperty(this, '_raw', rawData);
		classHelper.setHiddenProperty(this, '_isDiscordClass', true);
	}
}



module.exports = iBase;