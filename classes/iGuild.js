const constants = require('../constants/constants.js');
const classHelper = require("./classHelper.js");
const iBase = require("./iBase.js");
const iRole = require("./iRole.js");
const iGuildMember = require("./iGuildMember.js");
const iTextChannel = require("./iTextChannel.js");
const iVoiceChannel = require("./iVoiceChannel.js");
const iChannelCategory = require("./iChannelCategory.js");
const iUser = require("./iUser.js");


/*
{
    "id": "41771983423143937",
    "application_id": null,
    "name": "Discord Developers",
    "icon": "SEkgTU9NIElUUyBBTkRSRUkhISEhISEh",
    "splash": null,
    "owner_id": "80351110224678912",
    "region": "us-east",
    "afk_channel_id": "42072017402331136",
    "afk_timeout": 300,
    "embed_enabled": true,
    "embed_channel_id": "41771983444115456",
    "verification_level": 1,
    "default_message_notifications": 0,
    "explicit_content_filter": 0,
    "mfa_level": 0,
    "widget_enabled": false,
    "widget_channel_id": "41771983423143937",
    "roles": [],
    "emojis": [],
    "features": ["INVITE_SPLASH"],
    "unavailable": false
}
*/

class iGuild extends iBase {
	constructor(discord, data) {
		super(discord, data)
		
		//classHelper.setHiddenProperty(this, 'data.members', data.members);
		
		//delete data.roles;
		//delete data.channels;
		//delete data.members;
		
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
		
		// role stuff
		this.roles = [];
		for (var i in data.roles) {
			var v = data.roles[i];
			var role = new iRole(this.discord, v);
			this.roles.push(role);
		}
		
		// channel stuff
		this.channels = [];
		this.channelCategories = [];
		for (var i in data.channels) {
			var v = data.channels[i];
			if (v.type == constants.CHANNELS.TEXT) this.channels.push(new iTextChannel(this.discord, v, this))
			else if (v.type == constants.CHANNELS.VOICE) this.channels.push(new iVoiceChannel(this.discord, v, this))
			else if (v.type == constants.CHANNELS.CATEGORY) this.channelCategories.push(new iChannelCategory(this.discord, v, this))
			else throw "OH NOOOOOOOOOOOOOOOOOO, UNKNOWN CHANNEL TYPE"
		}
	
		// guild member stuff
		this.members = [];
		for (var i in data.members) {
			var v = data.members[i];
			var duser = v.user;
			var member = new iGuildMember(this.discord, v, this);
			this.members.push(member);
			var user = this.discord.users.find(j => j.id == member.id);
			if (!user) {
				user = new iUser(discord, duser)
				this.discord.users.push(user);
			}
		}
	
		classHelper.setHiddenProperty(this, 'setChannel', function(channel, value) {
			var index, array
			if (channel.type == constants.CHANNELS.CATEGORY) array = this.channelCategories;
			else array = this.channels;
			index = array.findIndex(c => c.id==channel.id);
			
			
			if (index == -1) array.push(channel); // new channel!
			else {
				if (value == undefined) array.splice(index, 1);
				else array[index] = value;
			}
		})
		
		
	}
	
	get textChannels() {
		let channels = [];
		for (var i in this.channels) {
			var v = this.channels[i]
			if (v.type==0) channels.push(v)
		}
		return channels;
	}
	
	get voiceChannels() {
		let channels = [];
		for (var i in this.channels) {
			var v = this.channels[i]
			if (v.type==2) channels.push(v)
		}
		return channels;
	}
	
	get owner() { return this.members.find(m => m.id==this.owner_id) }
	
	getBans() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.bans, {"guild.id": this.id})
			discord.http.get(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						var bans = JSON.parse(rawData);
						bans.forEach((data) => {
							data.user = new iUser(discord, data.user)
						})
						resolve(bans);
						return
					}
					reject(rawData);
				}
			)
		}) 
	}
	
	getInvites() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.invites, {"guild.id": this.id})
			discord.http.get(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						var invites = JSON.parse(rawData);
						invites.forEach((invite) => {
							invite.guild = discord.guilds.find(g => g.id == invite.guild.id);
							if (invite.inviter) {
								// not sure whether i should make it guild members or not; will go for not atm
								invite.inviter = new iUser(discord, invite.inviter); //invite.guild.members.find((m) => m.id==invite.inviter.id)
							}
							invite.channel = discord.channels.find(c => c.id == invite.channel.id);
						})
						resolve(invites);
						return
					}
					reject(rawData);
				}
			)
		}) 
	}
	
	getEmojis() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.emojis, {"guild.id": this.id})
			discord.http.get(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						var emojis = JSON.parse(rawData);
						emojis.forEach((emoji) => {
							emoji.user = new iUser(discord, emoji.user);
						})
						resolve(emojis);
						return
					}
					reject(rawData);
				}
			)
		}) 
	}
	
	deleteEmoji(id) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.deleteEmoji, {"guild.id": this.id, "id": id})
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) {
						return resolve();
					}
					return reject("Failed: either the ID of the emoji doesn't exist, or the id wasn't submitted in string form")
				}
			)
		}) 
	}
	
	uploadEmoji(name, content) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			if (typeof(name) != 'string') return reject('expected a name for the first argument in uploadEmoji');
			content = classHelper.convertImage(content);
			if (content == null) return reject('expected a buffer for the second argument in uploadEmoji');
			var url = classHelper.formatURL(discord.endpoints.emojis, {"guild.id": this.id});
			discord.http.post(
				url,
				JSON.stringify({
					"image": content,
					"name": name
				}),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==201) {
						resolve(JSON.parse(rawData));
						return;
					}
					reject(rawData);
				}
			)
		}) 
	}
	
	kickMember(id, reason) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.kickMember, {"guild.id": this.id, "user.id": id});
			
			if (classHelper.snowflake(reason)==true) {
				url = url + "?reason=" + reason
			}
			
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject(rawData);
				}
			)
		})
	}
	
	banMember(id, reason, delete_message_days) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.banMember, {"guild.id": this.id, "user.id": id});
			
			if (classHelper.snowflake(delete_message_days) == false) delete_message_days = 0;
			url = url + "?delete-message-days=" + delete_message_days;
			
			if (classHelper.snowflake(reason)==true) {
				url = url + "&reason=" + reason
			}
			
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
	
	unbanUser(id) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.banMember, {"guild.id": this.id, "user.id": id});
			
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject(rawData);
				}
			)
		})
	}
	
	
	
	deleteInvite(inviteCode) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.deleteInvite, {"code": inviteCode});
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) return resolve(rawData);
					reject(rawData);
				}
			)
		})
	}
	
	// method not allowed for bots apparently; probably why i didnt see it documented in the api
	// just gonna leave it here i guess since i already coded it
	createInvite(max_age, max_uses, temporary_membership) {
		// {"max_age":0,"max_uses":1,"temporary":true}
		// {"max_age":1800,"max_uses":0,"temporary":false}
		
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			if (classHelper.snowflake(max_age)==false) return reject('max_age argument expected a number');
			if (classHelper.snowflake(max_uses)==false) return reject('max_uses argument expected a number');
			if (typeof(temporary_membership) != 'boolean') return reject('temporary_membership expected a boolean');
			
			var url = classHelper.formatURL(discord.endpoints.invites, {"guild.id": this.id})
			discord.http.post(
				url,
				JSON.stringify({
					"max_age": max_age,
					"max_uses": max_uses,
					"temporary_membership": temporary_membership
				}),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) {
						var invites = JSON.parse(rawData);
						invites.forEach((invite) => {
							invite.guild = discord.guilds.find(g => g.id == invite.guild.id);
							if (invite.inviter) {
								invite.inviter = new iUser(discord, invite.inviter);
							}
							invite.channel = discord.channels.find(c => c.id == invite.channel.id);
						})
						resolve(invites);
						return
					}
					reject(rawData);
				}
			)
		}) 
	}
	
	
	
	
	
}


module.exports = iGuild;














		/*
		for (var index in data) {
			var value = data[index]
			if (index == 'roles') {
				for (var key in value) { value[key] = new iRole(value[key]) }
				this[index] = value;
				
			} else if (index == 'members') {
				for (var key in value) { value[key] = new iGuildMember(value[key], this) }
				this[index] = value;
				
			} else {
				this[index] = value;
			}
		}
		*/
		
		
		/*
		for (var index in members) {
			var info = members[index]
			var userInfo = info.user;
			var roles = info.roles;
			delete info.user
			delete info.roles
			
			var customaryData = {
				"roles": [],
				"guild": this
			}	
			for (var j in userInfo) customaryData[j] = userInfo[j]
			for (var j in info) customaryData[j] = info[j]
			for (var j in roles) {
				var roleId = roles[j]
				var roleObj = this.roles.find(r => r.id==roleId);
				customaryData.roles.push(roleObj);
			}
			if (customaryData.nick == undefined) customaryData.nick = null;
			this.members.push(new iGuildMember(customaryData))
		}
		
		*/




