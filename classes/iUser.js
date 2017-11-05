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
		
		if (classHelper.lib().users.find(u => u.id==this.id)==undefined) {
			classHelper.lib().users.push(this);
		}
		
		
	}

	get fullName() { return `${this.username}#${this.discriminator}` }
	
	get isFriend() {
		if (classHelper.lib().friends.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get isBlocked() {
		if (classHelper.lib().blocked.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get note() {
		return classHelper.lib().notes.find(n => n.id==this.id);
	}
	
	openDM() {
		var discord = classHelper.discord();
		return new Promise((resolve, reject) => {
			var data = {recipient_id: this.id};
			discord.http.post(
				discord.endpoints.createDM,
				JSON.stringify(data),
				function(error, response, rawData) {
					var data = JSON.parse(rawData);
					if (data.code) {
						return reject(data.message)
					}
					const iDMChannel = require('./iDMChannel.js')
					var dm = new iDMChannel(data);
					resolve(dm);
				}
			)
		})
	}
	
	isMemberOf(guild) {
		var lib = classHelper.lib();
		if (classHelper.isSafe(guild)) return lib.guilds.find(g => g.id==guild.id);
	}
	
	setAvatar(data) {
		var discord = classHelper.discord();
		
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