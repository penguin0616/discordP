const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iPermissions = require("./iPermissions.js");
const iVoiceConnection = require("./iVoiceConnection.js");

class iVoiceChannel extends iChannel {
	constructor(discord, data, guild_id) {
		super(discord, data, guild_id);
		var lib = this.discord;
		if (lib.channels[this.id]==undefined) lib.channels[this.id] = this;
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
			/*
			if (yay==true) {
				var con = new iVoiceConnection(discord, self);
				console.log('A')
				resolve(con);
				return;
			}
			*/
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
			//if (yay==true) return resolve();
			reject();
		})
	}
}

module.exports = iVoiceChannel;