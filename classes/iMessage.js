const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iUser = require("./iUser.js");
const iEmoji = require("./iEmoji.js");
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
		
		if (data.reactions) {
			data.reactions.forEach(rawr => {
				rawr.emoji = new iEmoji(discord, rawr.emoji);
			})
		}
		
		for (var index in data) {
			var value = data[index]
			this[index] = value
		}
	}
	
	get channel() {
		return this.discord.channels[this.channel_id];
	}
	
	get isDM() {
		if (this.channel && this.channel.isDMChannel == true) return true;
		return false;
	}
	
	get guild() {
		 var g = this.discord.guilds[this.channel.guild_id];
		 return g;
	}
	
	get selfOwned() {return this.author.id == this.discord.user.id}
	
	reply(content, tts, embed) {
		return this.channel.sendMessage(`${this.author.mention}, ${content}`, tts, embed);
	}
	
	delete() {
		return this.channel.deleteMessage(this.id);
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
					reject(rawData);
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
					reject(rawData);
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
					
					reject(rawData);
				}
			)
		})
	}
	
	addReaction(emoji) {
		return this.channel.addMessageReaction(this.id, emoji);
	}
	
	deleteReaction(emoji, userId) {
		return this.channel.deleteMessageReaction(this.id, emoji, userId);
	}
	
	deleteReactions() {
		return this.channel.deleteMessageReactions(this.id);
	}
}

module.exports = iMessage;












