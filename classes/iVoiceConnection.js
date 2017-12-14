const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");

class iVoiceConnection extends iBase {
	constructor(discord, channel) {
		super(discord, channel);
		
		this.channel_id = channel.id;
		this.guild_id = channel.guild_id;
		
		this.booted = false;
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