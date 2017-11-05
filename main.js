var lib = {}

// discord
var discord = {
	user: undefined,
	
	loggedIn: false,
	
	http: require("./networking/sendRequests.js"),
	endpoints: require("./constants/endpoints.js"),
	startGateway: require("./networking/gateway.js")
}

// events
const eventEmitter = require("events");
{
	class myEmitter extends eventEmitter {}
	lib.events = new myEmitter();
	
	discord.events = new myEmitter();
}

// const/class/etc
const constants = require('./constants/constants.js');
const iUser = require("./classes/iUser.js");
const iGuildMember = require("./classes/iGuildMember.js");
const iMessage = require("./classes/iMessage.js");
const iGuild = require("./classes/iGuild.js");
const iDMChannel = require("./classes/iDMChannel.js");
const iTextChannel = require("./classes/iTextChannel.js");
const iVoiceChannel = require("./classes/iVoiceChannel.js");
const iChannelCategory = require("./classes/iChannelCategory.js");





// stuff
lib.user = undefined;

lib.guilds = [];
lib.channels = [];

lib.users = [];
lib.friends = [];
lib.blocked = [];
lib.notes = [];

discord.messages = [];


discord.events.on('READY', (e) => {
	// user
	lib.user = new iUser(e.user);
	delete e.user;
	
	// guilds
	for (var index in e.guilds) {
		var rawGuild = e.guilds[index];
		lib.guilds.push(new iGuild(rawGuild));
	}
	delete e.guilds;
	
	// relationships
	for (var index in e.relationships) {
		var relation = e.relationships[index];
		if (relation.type == constants.RELATIONSHIPS.FRIEND) {
			lib.friends.push(new iUser(relation.user));
		} else if (relation.type == constants.RELATIONSHIPS.BLOCKED) {
			lib.blocked.push(new iUser(relation.user));
		} else {
			throw "unknown relationship found";
			//console.log(relationship);
		}
	}
	delete e.relationships;
	
	// notes
	for (var id in e.notes) {
		var note = e.notes[id];
		lib.notes.push({id: id, note: note})
	}
	delete e.notes;
	
	// experiments
	delete e.experiments;
	
	// friend_sugggestion_count
	delete e.friend_suggestion_count;
	
	// connected_accounts
	delete e.connected_accounts;
	
	// analytics_token
	delete e.analytics_token;
	
	// _trace
	delete e._trace;
	
	// read_state
	delete e.read_state;
	
	// session_id
	delete e.session_id;
	
	// tutorial
	delete e.tutorial;
	
	// presences
	delete e.presences; // from friends
	
	// v
	delete e.v; // version of gateway/api/whatever
	
	// user_settings
	delete e.user_settings;
	
	// user_guild_settings
	delete e.user_guild_settings;
	
	// private_channels
	for (var index in e.private_channels) {
		var channel = e.private_channels[index]
		if (channel.type == constants.CHANNELS.DM || channel.type == constants.CHANNELS.GROUP_DM) { // dm / group dm
			lib.channels.push(new iDMChannel(channel));
		} else throw 'unknown private_channel type found'
	}
	delete e.private_channels;
})
discord.events.on('MESSAGE_CREATE', (m) => {
	var msg = new iMessage(m);
	
	discord.messages[msg.id]={edits:[]}
	discord.messages[msg.id].original = msg;
	discord.messages[msg.id].current = msg;
	
	lib.events.emit('MESSAGE_CREATE', msg);
})
discord.events.on('GUILD_MEMBER_ADD', (m) => {
	var gm = new iGuildMember(m, lib.guilds.find(g => g.id==m.guild_id));
	lib.events.emit('GUILD_MEMBER_ADD', gm);
})
discord.events.on('GUILD_MEMBER_REMOVE', (m) => {
	var gm = new iGuildMember(m, lib.guilds.find(g => g.id==m.guild_id));
	lib.events.emit('GUILD_MEMBER_REMOVE', gm);
})
discord.events.on('MESSAGE_UPDATE', (m) => {
	if (m.author==undefined) return; // embed
	if (m.author.username!='penguin0616') return;
	var msg = new iMessage(m);
	var info = discord.messages[msg.id]
	if (info==undefined) { // created before we could log it
		discord.messages[msg.id]={edits:[]}
		discord.messages[msg.id].original = msg;
		discord.messages[msg.id].current = msg;
		return;
	}
	var last = info.edits[info.edits.length]
	var last2 = info.edits[info.edits.length - 1]
	if (last == undefined && last2 == undefined) {
		last = msg;
		last2 = info.original;
	} else if (last == undefined && last2 != undefined) {
		last = msg;
	}
	if (last.pinned != last2.pinned) return; // just a pin
	lib.events.emit('MESSAGE_EDIT', last, last2);
	info.current = msg;
})
discord.events.on('MESSAGE_DELETE', (d) => {
	var info = discord.messages[d.id]
	if (info==undefined) return;
	var msg = info.edits[info.edits.length-1]
	if (msg == undefined) msg = info.original;
	msg.deleted = true;
	lib.events.emit('MESSAGE_DELETE', msg);
})
discord.events.on('MESSAGE_DELETE_BULK', (d) => {
	var msgs = [];
	for (var index in d.ids) {
		var id = d.ids[index];
		var info = discord.messages[id];
		if (info) {
			var msg = info.current;
			msg.deleted = true;
			msgs.push(msg);
		}
	}
	lib.events.emit('MESSAGE_DELETE_BULK', msgs);
})
discord.events.on('GUILD_MEMBER_UPDATE', (d) => {
	var gm = new iGuildMember(d, lib.guilds.find(g => g.id==d.guild_id));
	lib.events.emit('GUILD_MEMBER_UPDATE', gm);
})
discord.events.on('CHANNEL_DELETE', (d) => {
	var channel
	if (d.type == constants.CHANNELS.TEXT) channel = new iTextChannel(d);
	else if (d.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(d);
	else if (d.type == constants.CHANNELS.CATEGORY) channel = new iChannelCategory(d);
	else throw "oh no, a unknown type of channel was deleted! send penguin pic of this data: " + JSON.stringify(d);
	
	lib.events.emit('CHANNEL_DELETE', channel);
})
discord.events.on('CHANNEL_CREATE', (d) => {
	var channel
	if (d.type == constants.CHANNELS.TEXT) channel = new iTextChannel(d);
	else if (d.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(d);
	else if (d.type == constants.CHANNELS.CATEGORY) channel = new iChannelCategory(d);
	else throw "oh no, a unknown type of channel was deleted! send penguin pic of this data: " + JSON.stringify(d);
	
	lib.events.emit('CHANNEL_CREATE', channel);
})
discord.events.on('GUILD_BAN_ADD', (d) => {
	var gm = new iGuildMember(d, lib.guilds.find(g => g.id==d.guild_id))
	lib.events.emit('GUILD_BAN_ADD', gm);
})
discord.events.on('GUILD_BAN_REMOVE', (d) => {
	var gm = new iGuildMember(d, lib.guilds.find(g => g.id==d.guild_id))
	lib.events.emit('GUILD_BAN_REMOVE', gm);
})
discord.events.on('GUILD_UPDATE', (d) => {
	// different information than a standard guild. god damnit. 
	// do shitty merge here
	// probably will lead to inconsistencies, but blame discord for too many variances of information at this point
	
	var stored = lib.guilds.find(g => g.id==d.id);
	var raw={}
	
	for (var i in stored) {
		raw[i] = stored[i]
	}
	for (var i in d) {
		if (raw[i]==undefined) raw[i] = d[i]
	}
	var guild = new iGuild(raw);
	
	lib.events.emit('GUILD_UPDATE', guild);
})
discord.events.on('GUILD_CREATE', (g) => {
	lib.events.emit('GUILD_CREATE', new iGuild(g)) // seems ok
})
discord.events.on('GUILD_DELETE', (g) => {
	lib.events.emit('GUILD_DELETE', new iGuild(g)) // seems ok
})


discord.events.on('VOICE_STATE_UPDATE', (data) => {
	if (data.channel_id==null) {
		console.log('Someone left a voice call.');
		return;
	}
	console.log(data);
})




discord.events.on('ANY', (name, d) => {
	//lib.events.emit('ANY', name, d);
	
	if (discord.events.listenerCount(name)==0) { // i'm not listening to the event, so just chuck it out (after some formatting?).
		
		if (d.user != undefined && d.user.id != undefined) { // something with a user.
			// guildmember?
			if (d.guild_id != undefined) {
				return lib.events.emit(name, new iGuildMember(d, lib.guilds.find(g => g.id==d.guild_id)))
			}
			
			
			// nothin? probably useless then
			return lib.events.emit(name, new iUser(d));
		}
		
		console.log('caught ANY', name, d);
		lib.events.emit(name, d);
	}
	
})


discord.events.on('MESSAGE_REACTION_ADD', (d) => {
	lib.events.emit('MESSAGE_REACTION_ADD', d) // could support fully sometime later
})
discord.events.on('MESSAGE_REACTION_REMOVE', (d) => {
	lib.events.emit('MESSAGE_REACTION_REMOVE', d) // could support fully sometime later
})
discord.events.on('CHANNEL_PINS_UPDATE', (d) => {
	lib.events.emit('CHANNEL_PINS_UPDATE', d) // will end up with message_update
})
discord.events.on('CHANNEL_PINS_ACK', (d) => {
	lib.events.emit('CHANNEL_PINS_ACK', d) // why even
})
discord.events.on('PRESENCE_UPDATE', (d) => {
	lib.events.emit('PRESENCE_UPDATE', d); // why even
})
discord.events.on('MESSAGE_ACK', (d) => {
	lib.events.emit('MESSAGE_ACK', d); // why even
})
discord.events.on('TYPING_START', (d) => {
	lib.events.emit('TYPING_START', d); // why even
})


// library
lib.connect = function(info) {
	if (discord.loggedIn) return; // already logged in
	const prom = new Promise((resolve, reject) => {
		if (info.token != undefined) return resolve(JSON.stringify(info))
		discord.http.post(discord.endpoints.login, JSON.stringify(info), resolve, reject)
	})
	prom.then((d) => {
		let data = JSON.parse(d);
		if (data.token) {
			discord.token = data.token;
			discord.loggedIn = true;
			lib.events.emit('LOGIN_SUCCESS');
			//discord.getUser();
			discord.gateway = discord.startGateway();
			return;
		}
		lib.events.emit('LOGIN_FAIL', "INVALID LOGIN INFO");
	})
	prom.catch((e) => {
		lib.events.emit('LOGIN_FAIL', "UNABLE TO CONNECT TO DISCORD");
	})
}



lib.discord = function() { return discord }






module.exports = lib;









/*
var lib = {}

// modules
const httpGet = require("./modules/httpGet.js");
const httpPost = require("./modules/httpPost.js");
const eventEmitter = require("events");

// other const stuff
class myEmitter extends eventEmitter {}
const baseUrl = "https://discordapp.com"
const sendPost = function(path, postData, callback, onError) {
	let headers = {
		'Content-Type': 'application/json'
	}
	if (discord.token) headers['Authorization'] = discord.token;
	return httpPost({
		url: baseUrl + path,
		postData: postData,
		headers: headers
	}, callback, onError)
}


const sendGet = function(path, callback, onError) {
	let headers = {
		'Content-Type': 'application/json'
	}
	if (discord.token) headers['Authorization'] = discord.token;
	return httpGet({
		url: baseUrl + path,
		headers: headers
	}, callback, onError)
}

// data
var discord = {
	token: undefined,
	endpoints: {
		login: "/api/v6/auth/login", // "/auth/login"
		me: "/api/v6/users/@me"
	}
}



// events

lib.events = new myEmitter();


// local
var local = {}

local.getCurrentUser = function() {
	sendGet(discord.endpoints.me, function(d) {
		var data = JSON.parse(d);
	}, function() {
		console.log('wot happn')
	})
}


// lib

lib.connect = function(info) {
	const prom = new Promise((resolve, reject) => {
		if (info.token != undefined) return resolve(JSON.stringify(info))
		sendPost(discord.endpoints.login, JSON.stringify(info), resolve, reject)
	})
	prom.then((d) => {
		let data = JSON.parse(d);
		if (data.token) {
			discord.token = data.token;
			lib.events.emit('LOGIN_SUCCESS');
			
			
			asd();
			
			
			return;
		}
		lib.events.emit('LOGIN_FAIL', "INVALID LOGIN INFO");
	})
	prom.catch((e) => {
		lib.events.emit('LOGIN_FAIL', "UNABLE TO CONNECT TO DISCORD");
	})
}







module.exports = lib;
*/