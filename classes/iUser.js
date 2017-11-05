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
		
		if (this.username == undefined && this.name != undefined) this.username = this.name;
		
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
			var data = {
				recipient_id: this.id
			};
			
			
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
	
	edit(currentPassword, username, avatar, email, newPassword) {
		var discord = classHelper.discord();
		var user = discord.user;
		username = username || user.username;
		email = email || user.email;
		newPassword = newPassword | null;
		
		if (!avatar || !(avatar instanceof Buffer)) avatar = null;
		else {
			const types = {
				0xFFD8FF: "image/jpg",
				0x89504E: "image/png"
			};
			const magic = avatar.readUIntBE(0, 3);
			const type = types[magic];
			if (!type) avatar = null;
			else avatar = `data:${type};base64,` + avatar.toString("base64");
		}
		
		var data = {
			username: username,
			email: email,
			password: currentPassword,
			avatar: avatar
		};
		
		if (newPassword != null) data.newPassword = newPassword;
		
		return new Promise((resolve, reject) => {
			discord.http.patch(
				discord.endpoints.me, 
				JSON.stringify(data),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						resolve(new iUser(JSON.parse(rawData)));
					} else reject("Failed to update user.");
				}
			)
		})
	}
	
	setAvatar(avatar, currentPassword) {
		var discord = classHelper.discord();
		if (discord.user.bot==true && currentPassword==undefined) return reject('setAvatar arg#2 needs password.');
		return this.edit(currentPassword, undefined, avatar, undefined, undefined);
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