const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");


class iChannel extends iBase {
	constructor(discord, data, guild) {
		super(discord, data);
		for (var index in data) {
			var value = data[index]
			this[index] = value
		}
		
		if (guild != undefined) {
			this.guild_id = guild.id;
		}
	}
	
	get guild() {
		if (this.guild_id == undefined) return undefined;
		return this.discord.guilds.find(g => g.id == this.guild_id)
	}
}




module.exports = iChannel;





// dm
		/*
		{
			type: 1,
			recipients: [
				{
					username: '',
					id: '',
					discriminator: '',
					avatar: ''
				}
			],
			last_message_id: '',
			id: ''
		}
		*/
		
		// group dm
		/*
		{
			type: 3,
			recipients: [
				{
					username: '',
					id: '',
					discriminator: '',
					avatar: ''
				}
			],
			owner_id: '',
			name: null,
			last_message_id: '',
			id: '',
			icon: null
		}
		*/