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
	constructor(data) {
		super(data);
		
		this.author = new iUser(data.author);
		delete data.author;
		
		if (data.deleted==undefined) data.deleted=false;
		
		for (var index in data) {
			var value = data[index]
			this[index] = value
		}
		
		Object.preventExtensions(this)
	}
	
	get channel() {
		return require("../main.js").channels.find(c => c.id == this.channel_id);
	}
}

module.exports = iMessage;












