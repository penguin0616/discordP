const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");


class iChannel extends iBase {
	constructor(data, guild) {
		super(data);
		for (var index in data) {
			var value = data[index]
			this[index] = value
		}
		
		if (guild != undefined) {
			classHelper.setHiddenProperty(this, '_guild', guild);
			this.guild_id = guild.id;
		}
	}
	
	get guild() {
		if (this.guild_id == undefined) return undefined;
		return require("../main.js").guilds.find(g => g.id == this.guild_id)
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