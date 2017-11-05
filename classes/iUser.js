const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iUser extends iBase {
	constructor(data) {
		super(data);
		
		if (data.user) {
			classHelper.setHiddenProperty(this, 'raw_user', data.user);
			for (var i in data.user) this[i] = data.user[i];
			delete data.user;
		}
		
		
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
	}

	get fullName() { return `${this.username}#${this.discriminator}` }
	
	get isFriend() {
		if (require("../main.js").friends.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get isBlocked() {
		if (require("../main.js").blocked.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get note() {
		return require("../main.js").notes.find(n => n.id==this.id);
	}
}

module.exports = iUser;




/*
	@me returns:
	{
		username: 'person',
		verified: true,
		mfa_enabled: false,
		id: 'numbers',
		phone: null,
		avatar: 'somestring',
		discriminator: '0000',
		email: 'email'
	}
*/