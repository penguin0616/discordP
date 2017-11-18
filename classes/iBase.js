const classHelper = require('./classHelper.js');


class iBase {
	constructor(rawData) {
		classHelper.setHiddenProperty(this, '_raw', rawData);
		classHelper.setHiddenProperty(this, '_isDiscordClass', true);
		
		
		
		if (this.what != undefined) console.log(this.what);
	}
}



module.exports = iBase;