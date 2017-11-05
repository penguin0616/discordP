const constants = require('../constants/constants.js');

const classHelper = require("./classHelper.js");
const iBase = require("./iBase.js");
const iRole = require("./iRole.js");
const iGuildMember = require("./iGuildMember.js");
const iTextChannel = require("./iTextChannel.js");
const iVoiceChannel = require("./iVoiceChannel.js");
const iChannelCategory = require("./iChannelCategory.js");


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
	constructor(data) {
		var what = super(data)
		
		classHelper.setHiddenProperty(this, 'raw_roles', data.roles);
		classHelper.setHiddenProperty(this, 'raw_channels', data.channels);
		classHelper.setHiddenProperty(this, 'raw_members', data.members);
		
		delete data.roles;
		delete data.channels;
		delete data.members;
		
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
		
		// role stuff
		this.roles = [];
		for (var i in this.raw_roles) {
			var v = this.raw_roles[i];
			var role = new iRole(v);
			this.roles.push(role);
		}
		
		// channel stuff
		this.channels = [];
		this.channelCategories = [];
		for (var i in this.raw_channels) {
			var v = this.raw_channels[i];
			if (v.type == constants.CHANNELS.TEXT) this.channels.push(new iTextChannel(v, this))
			else if (v.type == constants.CHANNELS.VOICE) this.channels.push(new iVoiceChannel(v, this))
			else if (v.type == constants.CHANNELS.CATEGORY) this.channelCategories.push(new iChannelCategory(v, this))
		}
	
		// guild member stuff
		this.members = [];
		for (var i in this.raw_members) {
			var v = this.raw_members[i];
			var member = new iGuildMember(v, this);
			this.members.push(member);
		}
		
		//if (this.name == 'we hak tusk here') console.log('X:', this.name, this.id)
		//if (this.name == 'that one server') console.log('Y:', this.name, this.id)
	
		
		
		
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




