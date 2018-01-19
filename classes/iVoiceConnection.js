const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iVoiceConnection extends iBase {
	constructor(discord, channel) {
		super(discord, channel);
		
		this.channel_id = channel.id;
		this.guild_id = channel.guild_id;
		
		this.booted = false;
		
		var index = discord.voiceConnections.findIndex(c => c.channel_id);
		if (index == -1) index = discord.voiceConnections.length;
		discord.voiceConnections[index] = this;
	}
	
	get channel() { return this.discord.channels.find(c => c.id==this.channel_id)}
	get guild() { return this.discord.guilds.find(g => g.id==this.guild_id)}
	
	init() {
		if (this.booted == true) console.log('oh no');
		this.booted = true;
		var asd = require("../voice/asd.js");
		this.socket = new asd(this);
	}
	
}

module.exports = iVoiceConnection;