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
	constructor(data, guild) {
		super(data)
		if (guild == undefined) throw "attempt to construct iGuildMember with no reference to guild"
		
		delete this.roles;
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
		return classHelper.lib().guilds.find(g => g.id == this.guild_id)
	}
	
}

module.exports = iGuildMember;