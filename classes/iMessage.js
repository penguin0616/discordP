const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iUser = require("./iUser.js");

/*
{
    "reactions": [
        {
            "count": 1,
            "me": false,
            "emoji": {
                "id": null,
                "name": "🔥"
            }
        }
    ],
    "attachments": [],
    "tts": false,
    "embeds": [],
    "timestamp": "2017-07-11T17:27:07.299000+00:00",
    "mention_everyone": false,
    "id": "334385199974967042",
    "pinned": false,
    "edited_timestamp": null,
    "author": {
        "username": "Mason",
        "discriminator": "9999",
        "id": "53908099506183680",
        "avatar": "a_bab14f271d565501444b2ca3be944b25"
    },
    "mention_roles": [],
    "content": "Supa Hot",
    "channel_id": "290926798999357250",
    "mentions": [],
    "type": 0
}
*/
class iMessage extends iBase {
	constructor(discord, data) {
		super(discord, data);
		
		this.author = new iUser(discord, data.author);
		delete data.author;
		
		if (data.deleted==undefined) data.deleted=false;
		
		for (var index in data) {
			var value = data[index]
			this[index] = value
		}
	}
	
	get channel() {
		return this.discord.channels.find(c => c.id == this.channel_id);
	}
	
	delete() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.manageMessage, {"channel.id": this.channel_id, "message.id": this.id})
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject('delete failed for unknown reason');
				}
			)
		})
	}
	
	pin() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.channelPin, {"channel.id": this.channel_id, "message.id": this.id})
			
			discord.http.put(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject('pin failed for unknown reason');
				}
			)
		})
	}
	
	unpin() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.channelPin, {"channel.id": this.channel_id, "message.id": this.id})
			
			discord.http.delete(
				url, 
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==204) return resolve();
					reject('unpin failed for unknown reason');
				}
			)
		})
	}
	
	edit(content, embed) {
		var discord = this.discord;
		
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.manageMessage, {"channel.id": this.channel_id, "message.id": this.id});
			
			discord.http.patch(
				url,
				JSON.stringify({content: content, embed: embed}),
				function(error, response, rawData) {
					if (error) return reject(error);
					
					if (response.statusCode==200) return resolve(new iMessage(discord, JSON.parse(rawData)))
					
					reject('edit failed for unknown reason');
				}
			)
		})
	}
}

module.exports = iMessage;












