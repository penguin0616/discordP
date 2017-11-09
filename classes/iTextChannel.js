const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iMessage = require("./iMessage.js");
const iPermissions = require("./iPermissions.js");



class iTextChannel extends iChannel {
	constructor(data, guild) {
		for (var i in data.permission_overwrites) {
			var v = data.permission_overwrites[i];
			
			v.deny = new iPermissions(v.deny, data.type);
			v.allow = new iPermissions(v.allow, data.type);
		}
		
		super(data, guild);
		var lib = classHelper.lib();
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
	
	
	sendMessage(content, tts, embed) {
		var discord = classHelper.discord();
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.createMessage, {"channel.id": this.id})
			
			discord.http.post(
				url,
				JSON.stringify({
					content: content,
					//nonce: null, // dunno what that is
					tts: tts || false,
					// file: null, // what
					embed: embed || null
				}),
				function(error, response, rawData) {
					if (error) return reject(error);
					var data = JSON.parse(rawData);
					if (response.statusCode==200) return resolve(new iMessage(data))
					reject('Unable to send message: ' + data.message);
				}
			)
		})
	}
	
}

module.exports = iTextChannel;