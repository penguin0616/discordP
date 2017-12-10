const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iVoiceConnection extends iBase {
	constructor(discord, channel) {
		super(discord, channel);
		
		this.channel_id = channel.id;
		this.guild_id = channel.guild_id;
		//this.socket = 
	}
	
	get channel() { return this.discord.channels.find(c => c.id==this.channel_id)}
	get guild() { return this.discord.guilds.find(g => g.id==this.guild_id)}
	
	
	
}

module.exports = iVoiceConnection;