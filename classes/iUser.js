const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iUser extends iBase {
	constructor(discord, data) {
		super(discord, data);
		if (data.user) {
			for (var i in data.user) this[i] = data.user[i];
			delete data.user;
		}
		for (var index in data) this[index] = data[index];
	}

	get fullName() { return `${this.username}#${this.discriminator}` }
	
	get isFriend() {
		if (this.discord.friends.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get isBlocked() {
		if (this.discord.blocked.find(u => u.id == this.id)) return true;
		return false;
	}
	
	get note() {
		return this.discord.notes.find(n => n.id==this.id);
	}
	
	openDM() {
		var discord = this.discord;
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
					var dm = new iDMChannel(discord, data);
					resolve(dm);
				}
			)
		})
	}
	
	edit(currentPassword, username, avatar, email, newPassword) {
		var discord = this.discord;
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
						resolve(new iUser(JSON.parse(discord, rawData)));
					} else reject("Failed to update user.");
				}
			)
		})
	}
	
	setAvatar(avatar, currentPassword) {
		var discord = this.discord;
		if (discord.user.bot != true && currentPassword==undefined) return reject('setAvatar arg#2 needs password.');
		return this.edit(currentPassword, undefined, avatar, undefined, undefined);
	}
	
	
	setStatus(status, game) {
		var afk = (classHelper.type(status)=='object' && status.afk) || false;
		var type = (classHelper.type(status)=='object' && status.status) || status;
		
		if (classHelper.type(game)=='object') {
			if (game.name == undefined || game.type == undefined) game = null;
		} else if (classHelper.type(game) != 'object' && game != null) game = null;
		
		var data = {
			op: classHelper.constants().OPCODE.STATUS_UPDATE,
			d: {
				"game": game,
				"status": type,
				"since": null, // need to work on that
				"afk": afk
			}
		}
		this.discord.gateway.send(data)
	}
	
	memberOf(arg) {
		var id;
		if (classHelper.getClass(arg)=='iGuild') id = arg.id;
		else if (typeof(arg)=='string' || typeof(arg)=='number') id = arg;
		else throw "Attempt to call memberOf without an iGuild or a string."
		
		var guild = this.discord.guilds.find(g => g.id == id)
		if (guild) return guild.members.find(m => m.id == this.id);
	}
	
	get mention() {
		return `<@${this.id}>`;
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