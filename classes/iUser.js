const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iUser extends iBase {
	constructor(discord, data) {
		super(discord, data);
		
		var data = classHelper.clone(data);
		
		if (data.user) {
			for (var i in data.user) this[i] = data.user[i];
			delete data.user;
		}
		for (var index in data) this[index] = data[index];
		
		if (this.bot == undefined) this.bot = false;
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
	
	getApplication() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.oauth2Application, {"id": "297923705617514496"})
			discord.http.get(
				url,
				function(error, response, rawData) {
					var data = JSON.parse(rawData);
					if (response.statusCode==200) return resolve(data);
					reject(data);
				}
			)
		})
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
		newPassword = newPassword || null;
		
		avatar = classHelper.convertImage(avatar);
		
		var data = {
			username: username,
			avatar: avatar
		};
		
		if (email) data.email = email;
		if (currentPassword) data.password = currentPassword;
		if (newPassword != null) data.newPassword = newPassword;
		
		return new Promise((resolve, reject) => {
			if (discord.user.bot != true && currentPassword==undefined) return reject('setAvatar arg#2 needs password.');
			discord.http.patch(
				discord.endpoints.me, 
				JSON.stringify(data),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						resolve(new iUser(discord, JSON.parse(rawData)));
					} else reject("Failed to update user: " + rawData);
				}
			)
		})
	}
	
	setAvatar(avatar, currentPassword) {
		if (this.id != this.discord.user.id) return;
		
		var discord = this.discord;
		return this.edit(currentPassword, undefined, avatar, undefined, undefined);
	}
	
	
	setStatus(status, game) {
		var afk = (classHelper.type(status)=='object' && status.afk) || false;
		var type = (classHelper.type(status)=='object' && status.status) || status;
		
		if (classHelper.type(game)=='object') {
			console.log('a');
			if (game.name == undefined || game.type == undefined) game = null;
		} else game = null;
		
		var data = {
			op: classHelper.constants().GATEWAY_OPCODE.STATUS_UPDATE,
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