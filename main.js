var lib = {}

// discord
var discord = {
	// user stuff
	user: undefined,
	token: undefined,
	loggedIn: false,
	
	// other stuff
	http: require("./networking/sendRequests.js"),
	endpoints: require("./constants/endpoints.js"),
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

const gateway = require("./networking/gateway.js")

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
	// run heartbeat
	setInterval(function() {
		discord.gateway.ping();
	}, discord.gateway.heartbeat_interval)
	
	// user
	if (e.user.bot==true) discord.token = "Bot " + discord.token;
	discord.user = new iUser(e.user);
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
	lib.events.emit('GATEWAY_READY');
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
	/*
	var channel
	if (d.type == constants.CHANNELS.TEXT) channel = new iTextChannel(d);
	else if (d.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(d);
	else if (d.type == constants.CHANNELS.CATEGORY) channel = new iChannelCategory(d);
	else if (d.type == constants.CHANNELS.DM) channel = new iDMChannel(d); 
	else throw "oh no, a unknown type of channel was deleted! send penguin pic of this data: " + JSON.stringify(d);
	*/
	
	var channel = lib.channels.find(c => c.id==d.id);
	
	if (channel.guild) {
		channel.guild.setChannel(channel, undefined);
	}
	
	
	/*
	var index = lib.channels.findIndex(c => c.id==d.id);
	var channel = lib.channels[index]
	lib.channels.splice(index, 1);
	
	var g = lib.guilds.find(g => g.id == d.guild_id);
	if (g != undefined) {
		if (d.type == constants.CHANNELS.CATEGORY) {
			var i = g.channelCategories.findIndex(c => c.id==d.id);
			g.channelCategories.splice(i, 1);
		} else {
			var i = g.channels.findIndex(c => c.id==d.id);
			g.channels.splice(i, 1);
		}
	}
	*/
	
	lib.events.emit('CHANNEL_DELETE', channel);
})
discord.events.on('CHANNEL_CREATE', (d) => {
	var channel, cat
	if (d.type == constants.CHANNELS.TEXT) channel = new iTextChannel(d);
	else if (d.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(d);
	else if (d.type == constants.CHANNELS.CATEGORY) {channel = new iChannelCategory(d); cat = true; }
	else if (d.type == constants.CHANNELS.DM) channel = new iDMChannel(d); 
	else throw "oh no, a unknown type of channel was created! send penguin pic of this data: " + JSON.stringify(d);
	
	/*
	var g = lib.guilds.find(g => g.id == d.guild_id);
	if (g != undefined) {
		if (cat==true) g.channelCategories.push(channel)
		else g.channels.push(channel)
	}
	*/
	if (channel.guild) {
		channel.guild.setChannel(channel);
	}
	
	lib.events.emit('CHANNEL_CREATE', channel);
})
discord.events.on('CHANNEL_UPDATE', (d) => {
	/*
	var index = lib.channels.findIndex(c => c.id==d.id);
	var channel = new iChannel(d)
	lib.channels[index] = channel;
	*/
	
	var channel = lib.channels.find(c => c.id==d.id);
	
	if (channel.guild) {
		channel.guild.setChannel(channel, channel);
	}
	
	lib.events.emit('CHANNEL_UPDATE', channel);
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
	
	console.log('asd:',d);
	
	/*
	var stored = lib.guilds.find(g => g.id==d.id);
	var raw={}
	
	for (var i in stored) {
		raw[i] = stored[i]
	}
	for (var i in d) {
		if (raw[i]==undefined) raw[i] = d[i]
	}
	var guild = new iGuild(raw);
	*/
	
	lib.events.emit('GUILD_UPDATE', guild);
})
discord.events.on('GUILD_CREATE', (d) => {
	var guild = new iGuild(d);
	var index = lib.guilds.findIndex(g => g.id==d.id);
	lib.guilds[index] = guild;
	
	lib.events.emit('GUILD_CREATE', guild) // seems ok
})
discord.events.on('GUILD_DELETE', (d) => {
	var index = lib.guilds.findIndex(g => g.id==d.id);
	var guild = lib.guilds[index];
	lib.guilds.splice(index, 1);
	lib.events.emit('GUILD_DELETE', guild) // seems ok
})
discord.events.on('USER_UPDATE', (d) => {
	if (d.id == lib.user.id) {
		var index = lib.users.findIndex(u => u.id==lib.user.id);
		
		var user = new iUser(d);
		lib.user = user;
		discord.user = user;
		lib.users[index] = user;
		return;
	}
})

discord.events.on('VOICE_STATE_UPDATE', (data) => {
	if (data.channel_id==null) {
		console.log('Someone left a voice call.');
		return;
	}
	
	//console.log(data);
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
		if (info.token != undefined) {
			return resolve(JSON.stringify(info))
		}
		discord.http.post(discord.endpoints.login, JSON.stringify(info), function(error, response, rawData) {
			if (error) return reject(error);
			console.log(rawData);
			if (response.statusCode != 200) return reject('Failed to login to discord');
			return resolve(rawData);
		})
	})
	prom.then((d) => {
		let data = JSON.parse(d);
		if (data.token) {
			discord.token = data.token;
			discord.loggedIn = true;
			lib.events.emit('LOGIN_SUCCESS');
			discord.gateway = new gateway(discord, 1, 1);
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









