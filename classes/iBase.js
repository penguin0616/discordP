const classHelper = require('./classHelper.js');


class iBase {
	constructor(rawData) {
		classHelper.setHiddenProperty(this, '_raw', rawData);
	}
}



module.exports = iBase;