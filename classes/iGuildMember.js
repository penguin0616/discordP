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
	constructor(discord, data, guild_id) {
		var roles = data.roles;
		delete data.roles;
		super(discord, data);
		
		this.raw_roles = roles;
		
		if (guild_id == undefined) {
			console.log(data);
			throw "attempt to construct iGuildMember with no reference to guild"
		}
		
		
		this.nick = (this.nick != undefined && this.nick) || null
		if (this.guild_id==undefined) this.guild_id = guild_id;
		
	}
	
	get roles() {
		return this.discord.guilds[this.guild_id];
	}
	
	get guild() {
		return this.discord.guilds[this.guild_id];
	}
	
	setNickname(nick) {
		return this.guild.setMemberNickname(this.id, nick);
	}
	serverMute() {
		return this.guild.serverMuteMember(this.id);
	}
	serverUnmute() {
		return this.guild.serverUnmuteMember(this.id);
	}
	serverDeafen() {
		return this.guild.serverDeafenMember(this.id);
	}
	serverUndeafen() {
		return this.guild.serverUndeafenMember(this.id);
	}
	moveToVoiceChannel(channel) {
		return this.guild.moveMemberToVoiceChannel(this.id, channel);
	}
	
	kick(reason) {
		if (this.guild == undefined) {
			return (new Promise((resolve, reject) => {reject('iGuildMember seems to be missing guild?')}))
		}
		return this.guild.kickMember(this.id, reason);
	}
	
	ban(reason, delete_message_days) {
		if (this.guild == undefined) {
			return (new Promise((resolve, reject) => {reject('iGuildMember seems to be missing guild?')}))
		}
		return this.guild.banMember(this.id, reason, delete_message_days);
	}
	
	assignRole(arg) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			
			var id = (classHelper.getClass(arg) == 'iRole') ? arg.id : arg;
			if (typeof(id) != 'string') return reject('assignRole arg#1 expected an Id');

			var url = classHelper.formatURL(discord.endpoints.manageMemberRole, {"guild.id": this.guild_id, "user.id": this.id, "role.id": id})
			
			discord.http.put(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve(rawData);
					reject(rawData);
				}
			)
		})
	}
	
	unassignRole(arg) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			
			var id = (classHelper.getClass(arg) == 'iRole') ? arg.id : arg;
			if (typeof(id) != 'string') return reject('unassignRole arg#1 expected an Id');

			var url = classHelper.formatURL(discord.endpoints.manageMemberRole, {"guild.id": this.guild_id, "user.id": this.id, "role.id": id})
			
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve(rawData);
					reject(rawData);
				}
			)
		})
	}
	
	/*
	ban(reason, delete_message_days) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.banMember, {"guild.id": this.guild_id, "user.id": this.id})
			if (delete_message_days && classHelper.snowflake(delete_message_days)==true) url = url + "?delete-message-days=" + delete_message_days
			discord.http.put(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject(rawData);
				}
			)
		})
	}
	*/
	
}

module.exports = iGuildMember;