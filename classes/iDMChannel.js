const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iUser = require("./iUser.js");
const iMessage = require("./iMessage.js"); // whoooooops

class iDMChannel extends iChannel {
	constructor(discord, data) {
		super(discord, data);
		
		this.recipients = [];
		for (var i in data.recipients) {
			var rawUser = data.recipients[i];
			var user = new iUser(this.discord, rawUser);
			this.recipients.push(user);
		}
	}
	
	get owner() {
		for (var i in this.recipients) {
			var u = this.recipients[i];
			if (u.id == this.owner_id) return u;
		}
	}
	
	sendMessage(content, tts, embed) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.createMessage, {"channel.id": this.id})
			discord.http.post(
				url,
				JSON.stringify({
					content: content,
					// nonce: null, // dunno what that is
					tts: tts || false,
					// file: null, // what
					embed: embed || null
				}),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) return resolve(new iMessage(discord, JSON.parse(rawData)))
					reject('Unable to send message');
				}
			)
		})
	}
	
	
}



module.exports = iDMChannel;