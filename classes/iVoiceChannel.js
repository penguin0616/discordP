const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iPermissions = require("./iPermissions.js");
const iVoiceConnection = require("./iVoiceConnection.js");

class iVoiceChannel extends iChannel {
	constructor(discord, data, guild) {
		for (var i in data.permission_overwrites) {
			var v = data.permission_overwrites[i];
			
			v.deny = new iPermissions(discord, v.deny, data.type);
			v.allow = new iPermissions(discord, v.allow, data.type);
		}
		
		super(discord, data, guild);
		var lib = this.discord;
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
	
	join(self_mute, self_deaf) {
		var discord = this.discord;
		var self = this;
		self_mute = self_mute || false;
		self_deaf = self_deaf || false;
		return new Promise((resolve, reject) => {
			var data = {
				"op": classHelper.constants().GATEWAY_OPCODE.VOICE_STATE_UPDATE,
				"d": {
					"guild_id": self.guild_id,
					"channel_id": self.id, 
					"self_mute": self_mute,
					"self_deaf": self_deaf
				}
			}
			var yay = discord.gateway.send(data)
			if (yay==true) {
				var index = discord.voiceConnections.findIndex(v => v.guild_id == self.guild_id);
				if (index != -1) discord.voiceConnections.splice(index, 1);

				var con = new iVoiceConnection(discord, self);
				discord.voiceConnections.push(con);
				
				resolve(con);
				
				return;
			}
			reject();
		})
	}
	
	leave() {
		var discord = this.discord;
		var self = this;
		return new Promise((resolve, reject) => {
			var data = {
				"op": classHelper.constants().GATEWAY_OPCODE.VOICE_STATE_UPDATE,
				"d": {
					"guild_id": self.guild_id,
					"channel_id": null, 
					"self_mute": false,
					"self_deaf": false
				}
			}
			var yay = discord.gateway.send(data)
			if (yay==true) return resolve();
			reject();
		})
	}
}

module.exports = iVoiceChannel;