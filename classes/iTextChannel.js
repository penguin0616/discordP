const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iChannel = require("./iChannel.js");
const iMessage = require("./iMessage.js");
const iPermissions = require("./iPermissions.js");



class iTextChannel extends iChannel {
	constructor(discord, data, guild) {
		for (var i in data.permission_overwrites) {
			var v = data.permission_overwrites[i];
			
			v.deny = new iPermissions(v.deny, data.type);
			v.allow = new iPermissions(v.allow, data.type);
		}
		
		super(discord, data, guild);
		var lib = this.discord;
		if (lib.channels.find(c => c.id==this.id)==undefined) lib.channels.push(this);
	}
	
	sendMessage(content, tts, embed) {
		var discord = this.discord;
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
					if (response.statusCode==200) return resolve(new iMessage(discord, data))
					reject('Unable to send message: ' + rawData);
				}
			)
		})
	}
	
	bulkDelete(msgs) {
		return new Promise((resolve, reject) => {
			
			var scraped = [];
			
			msgs.forEach((msg) => {
				if (classHelper.getClass(msg)=='iMessage') scraped.push(msg.id.toString());
				else if (classHelper.snowflake(msg)==true) scraped.push(msg.toString());
			})
			
			var url = classHelper.formatURL(this.discord.endpoints.bulkDelete, {"channel.id": this.id})
			this.discord.http.post(
				url,
				JSON.stringify({messages: scraped}),
				function(error, response, rawData) {
					if (error) return reject(error);
					console.log(response.statusCode, rawData);
					if (response.statusCode==204) return resolve();
					reject('Unable to bulk delete: ' + rawData);
				}
			)
		})
	}
	
	get deleteMessages() { return this.bulkDelete } // preference.exe
	
}

module.exports = iTextChannel;