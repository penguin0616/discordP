const classHelper = require('./classHelper.js');
const iUser = require('./iUser.js');
/*
{
	user: [Object] {
		username: "asd",
		id: "111",
		discriminator: "2314",
		avatar: "asd"
	},
	roles: [Object] [
		'id',
		'id',
		'id'
	], 
	nick: null (should be null or a string anyway),
	mute: false,
	joined_at: 'asd',
	deaf: false
}


*/

class iGuildMember extends iUser {
	constructor(discord, data, guild) {
		super(discord, data);
		if (guild == undefined) throw "attempt to construct iGuildMember with no reference to guild"
		
		this.roles = [];
		for (var i in data.roles) {
			var id = data.roles[i];
			var role = guild.roles.find(r => r.id==id);
			this.roles.push(role);
		}
		
		this.nick = (this.nick != undefined && this.nick) || null
		if (this.guild_id==undefined) this.guild_id = guild.id;
		
	}
	
	get guild() {
		return this.discord.guilds.find(g => g.id == this.guild_id)
	}
	
	setNickname(nick) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = discord.endpoints.modifyGuildMember;
			if (discord.user.id == this.id) url = discord.endpoints.modifyCurrentUsersNick
			
			url = classHelper.formatURL(url, {"guild.id": this.guild_id, "user.id": this.id})
			
			discord.http.patch(
				url,
				JSON.stringify({
					nick: nick
				}),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204 || response.statusCode==200) return resolve();
					reject('Unable to set nickname:' + rawData);
				}
			)
		})
	}
	
}

module.exports = iGuildMember;