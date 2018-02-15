// old format wasn't that great.
// if something breaks, blame Dark  Overlord#9351
// cuz hes a good scapegoat, though he probably changed his username since i put it here

// events
const eventEmitter = require("events");

// constants
const constants = require("./constants/constants.js");
const endpoints = require("./constants/endpoints.js");
const classHelper = require("./classes/classHelper.js");
const gateway = require("./networking/gateway.js");

// classes
const iUser = require("./classes/iUser.js");
const iGuildMember = require("./classes/iGuildMember.js");
const iMessage = require("./classes/iMessage.js");
const iGuild = require("./classes/iGuild.js");
const iDMChannel = require("./classes/iDMChannel.js");
const iTextChannel = require("./classes/iTextChannel.js");
const iVoiceChannel = require("./classes/iVoiceChannel.js");
const iChannelCategory = require("./classes/iChannelCategory.js");
const iVoiceConnection = require("./classes/iVoiceConnection.js");
const iRole = require("./classes/iRole.js");
const iCollection = require("./classes/iCollection.js");

// this
class discordp {
	constructor(data) {
		classHelper.setHiddenProperty(this, 'internal', {
			token: undefined,
			events: new eventEmitter(),
			messages: []
		});
		
		// status
		this.loggedIn = false;
		this.connected = false;
		
		this.constants = constants;
		
		// events/debug
		this.events = new eventEmitter();
		if (data.debug==true) {this.debug=true; console.log("Running a Discordp session in debug mode!");}
		
		// gateway
		/*
		if (data.shardId) {
			this.shardId = data.shardId;
			if (data.shardCount==undefined) throw "Attempt to assign shardId with no 'shardCount'."
			this.shardCount = data.shardCount;
		} else {this.shardId = 1; this.shardCount = 1;}
		*/
		this.shardCount = (data.shardCount != undefined) ? data.shardCount : 1
		
		if (data.autoReconnect==true) {
			this.autoReconnect=true;
			if (data.reconnectDelay) this.reconnectDelay = data.reconnectDelay;
			else this.reconnectDelay = 7000;
		}
		
		// make categories
		this.user = undefined;
		
		//this.guilds = [];
		//this.channels = [];
		//this.users = [];
		//this.friends = [];
		//this.blocked = [];
		//this.notes = [];
		
		classHelper.setHiddenProperty(this, 'guilds', new iCollection(this));
		classHelper.setHiddenProperty(this, 'channels', new iCollection(this));
		classHelper.setHiddenProperty(this, 'users', new iCollection(this));
		classHelper.setHiddenProperty(this, 'friends', []);
		classHelper.setHiddenProperty(this, 'blocked', []);
		classHelper.setHiddenProperty(this, 'notes', {});
		
		classHelper.setHiddenProperty(this, 'voiceConnections', new iCollection(this));
		
		classHelper.setHiddenProperty(this, 'http', require("./networking/sendRequests.js")())
		classHelper.setHiddenProperty(this, 'endpoints', require("./constants/endpoints.js"))
	}

	connect(login) {
		if (this.loggedIn==true) throw "Attempted to login while already successfully logged in.";
		var prom = new Promise((resolve, reject) => {
			if (login.token != undefined) return resolve(JSON.stringify(login))
			reject("No token supplied");
		})
		prom.then((raw) => {
			let data = JSON.parse(raw);
			if (data.token == undefined) throw "Failed to login to Discord.";
			this.internal.token = data.token;
			this.loggedIn = true;
			this.http.updateToken(this.internal.token);
			setupGateway(this);
		})
		prom.catch((e) => {throw "Failed to login to Discord."})
	}
}

function setupGateway(session) {
	classHelper.setHiddenProperty(session, 'gateway', new gateway(session, 0));
	for (var i = 1; i < session.shardCount; i++) {
		var ret = i;
		setTimeout(function() {
			classHelper.setHiddenProperty(session, 'gateway', new gateway(session, ret));
		}, ret*6000)
	}
	
	var internal = session.internal;
	var iEvents = internal.events;
	var eEvents = session.events;
	
	// Main
	
	iEvents.on('READY', (socket, e) => {
		// maybe only take specific data from certain shard with socket check
		// probably gonna have to use a collection class for the primary stuff, [id] = wat
		
		// noti
		if (session.debug) console.log(`Gateway[${socket.shard}] is ready.`);
		
		// start pulse
		setInterval(function() {
			socket.ping();
		}, socket.heartbeat_interval)
		
		
		// guilds
		e.guilds.forEach(guild => {
			session.guilds[guild.id] = new iGuild(session, guild);
		})
		delete e.guilds;
		
		// private_channels
		e.private_channels.forEach((channel) => {
			if (channel.type == constants.CHANNELS.DM || channel.type == constants.CHANNELS.GROUP_DM) { // dm / group dm
				session.channels[channel.id] = new iDMChannel(session, channel);
			} else
				throw 'unknown private_channel type found'
		})
		
		delete e.private_channels; 
		
		
		if (socket.shard != 0) return;
		
		// user
		if (e.user.bot==true && internal.token.startsWith("Bot ")==false) internal.token = "Bot " + internal.token;
		session.http.updateToken(internal.token);
		session.user = new iUser(session, e.user);
		session.users[e.user.id] = session.user;
		delete e.user;
		
		
		
		
		// relationships
		e.relationships.forEach(relation => {
			if (relation.type == constants.RELATIONSHIPS.FRIEND) {session.friends.push(new iUser(session, relation.user)); }
			else if (relation.type == constants.RELATIONSHIPS.BLOCKED) {session.blocked.push(new iUser(session, relation.user)); }
			else { throw "Unknown relationship found"; }
		})
		delete e.relationships;

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
		classHelper.setHiddenProperty(session, 'session_id', e.session_id);
		delete e.session_id;
		
		// tutorial
		delete e.tutorial;
		
		// presences
		delete e.presences; // from friends/users/idk
		
		// v
		delete e.v; // version of gateway/api/whatever
		
		// user_settings
		delete e.user_settings;
		
		// user_guild_settings
		delete e.user_guild_settings;
		
		// shard
		delete e.shard; // already know the shard stuff
		
		// notes
		for (var id in e.notes) {
			session.notes[id] = e.notes[id];
		}
		delete e.notes;
		
		if (JSON.stringify(e) != "{}" && session.debug) console.log(`Gateway[${socket.shard}] ready not completely parsed:`, e);
		
		eEvents.emit('GATEWAY_READY');
	})
	
	
	
	
	// Message
	iEvents.on('MESSAGE_CREATE', (socket, m) => {
		var msg = new iMessage(session, m);
		internal.messages[msg.id]={edits:[]}
		internal.messages[msg.id].original = msg;
		internal.messages[msg.id].current = msg;
		
		if ((msg.isDM==true && socket.shard==0) || msg.isDM==false) eEvents.emit('MESSAGE_CREATE', msg);
	})
	iEvents.on('MESSAGE_UPDATE', (socket, m) => {
		if (m.author==undefined) return; // embed
		var msg = new iMessage(session, m);
		var info = internal.messages[msg.id]
		if (info==undefined) { // created before we could log it
			internal.messages[msg.id]={edits:[]}
			internal.messages[msg.id].original = msg;
			internal.messages[msg.id].current = msg;
			return;
		}
		var last = info.edits[info.edits.length - 1]
		var last2 = info.edits[info.edits.length - 2]
		if (last == undefined && last2 == undefined) {
			last = msg;
			last2 = info.original;
		} else if (last == undefined && last2 != undefined) {
			last = msg;
		}
		if (last.pinned != last2.pinned) return; // just a pin
		if ((msg.isDM==true && socket.shard==0) || msg.isDM==false) eEvents.emit('MESSAGE_EDIT', last, last2); // new, old
		info.current = msg;
	})
	iEvents.on('MESSAGE_DELETE', (socket, d) => {
		var info = internal.messages[d.id]
		if (info==undefined) return;
		var msg = info.edits[info.edits.length-1]
		if (msg == undefined) msg = info.original;
		msg.deleted = true;
		
		if ((msg.isDM==true && socket.shard==0) || msg.isDM==false) eEvents.emit('MESSAGE_DELETE', msg);
	})
	iEvents.on('MESSAGE_DELETE_BULK', (socket, d) => {
		var msgs = [];
		for (var index in d.ids) {
			var id = d.ids[index];
			var info = internal.messages[id];
			if (info) {
				var msg = info.current;
				msg.deleted = true;
				msgs.push(msg);
			}
		}
		
		msgs.forEach((msg) => {
			eEvents.emit('MESSAGE_DELETE', msg);
		})
		
		eEvents.emit('MESSAGE_DELETE_BULK', msgs);
	})
	iEvents.on('MESSAGE_ACK', (socket, data) => {
		eEvents.emit('MESSAGE_ACK', data);
	})
	
	
	// Channel
	iEvents.on('CHANNEL_CREATE', (socket, data) => {
		var channel
		if (data.type == constants.CHANNELS.TEXT) channel = new iTextChannel(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.CATEGORY) channel = new iChannelCategory(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.DM || data.type == constants.CHANNELS.GROUP_DM) channel = new iDMChannel(session, data); 
		else throw "Unknown channel created?: " + JSON.stringify(data);
		
		if (channel.guild) {
			channel.guild.setChannel(channel, channel);
		}
		session.channels[channel.id] = channel;
		
		eEvents.emit('CHANNEL_CREATE', channel);
	})
	iEvents.on('CHANNEL_UPDATE', (socket, data) => {
		var old = session.channels[data.id];
		
		var channel
		if (data.type == constants.CHANNELS.TEXT) channel = new iTextChannel(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.VOICE) channel = new iVoiceChannel(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.CATEGORY) channel = new iChannelCategory(session, data, data.guild_id);
		else if (data.type == constants.CHANNELS.DM || data.type == constants.CHANNELS.GROUP_DM) channel = new iDMChannel(session, data); 
		else throw 'ah crap';
		
		if (old.guild) {
			old.guild.setChannel(channel, channel);
		}
		
		session.channels[channel.id] = channel;
		
		eEvents.emit('CHANNEL_UPDATE', old, channel);
	})
	iEvents.on('CHANNEL_DELETE', (socket, data) => {
		var channel = session.channels[data.id];
		if (channel.guild) {
			channel.guild.setChannel(channel, undefined);
		}
		delete session.channels[data.id];
		eEvents.emit('CHANNEL_DELETE', channel);
	})
	
	
	iEvents.on('CHANNEL_PINS_ACK', (socket, data) => {
		eEvents.emit('CHANNEL_PINS_ACK', data)
	})
	
	// Guild
	iEvents.on('GUILD_CREATE', (socket, data) => {
		var guild = new iGuild(session, data);
		session.guilds[guild.id] = guild
		eEvents.emit('GUILD_CREATE', guild) // seems ok
	})
	iEvents.on('GUILD_UPDATE', (socket, data) => {
		var guild = new iGuild(session, data)
		session.guilds[guild.id] = guild
		eEvents.emit('GUILD_UPDATE', guild);
	})
	iEvents.on('GUILD_DELETE', (socket, data) => {
		var guild = session.guilds[data.id];
		delete guild; // prob ok
		eEvents.emit('GUILD_DELETE', guild)
	})
	
	
	iEvents.on('GUILD_MEMBER_ADD', (socket, data) => {
		var user = session.users[data.id];
		if (!user) {
			user = new iUser(session, data.user);
			session.users[data.id] = user;
		}
		var gm = new iGuildMember(session, data, data.guild_id);
		eEvents.emit('GUILD_MEMBER_ADD', gm);
	})
	iEvents.on('GUILD_MEMBER_UPDATE', (socket, data) => {
		var user = session.users[data.user.id];
		var guild = session.guilds[data.guild_id];
		
		var member = new iGuildMember(session, data, data.guild_id);
		
		guild.members[guild.members.findIndex(m => m.id==data.user.id)] = member;
		
		
		eEvents.emit('GUILD_MEMBER_UPDATE', member);
	})
	iEvents.on('GUILD_MEMBER_REMOVE', (socket, data) => {
		var guild = session.guilds[data.guild_id];
		var memberIndex = guild.members.findIndex(m => m.id == data.user.id);
		var member = guild.members[memberIndex];
		guild.members.splice(memberIndex, 1);
		
		eEvents.emit('GUILD_MEMBER_REMOVE', member);
	})
	
	
	
	iEvents.on('GUILD_ROLE_CREATE', (socket, data) => {
		var role = new iRole(session, data.role, data.guild_id);
		var guild = session.guilds[data.guild_id];
		guild.roles.push(role);
	})
	
	iEvents.on('GUILD_ROLE_UPDATE', (socket, data) => {
		var role = new iRole(session, data.role, data.guild_id);
		var guild = session.guilds[data.guild_id];
		var index = guild.roles.findIndex(r => r.id==role.id);
		guild.roles[index] = role;
	})
	
	iEvents.on('GUILD_ROLE_DELETE', (socket, data) => {
		var guild = session.guilds[data.guild_id];
		var i = guild.roles.findIndex(v => v.id==data.role_id);
		guild.roles.splice(i, 1);
	})
	
	
	iEvents.on('GUILD_BAN_ADD', (socket, data) => {
		eEvents.emit('GUILD_BAN_ADD', new iUser(session, data));
	})
	iEvents.on('GUILD_BAN_REMOVE', (socket, data) => {
		eEvents.emit('GUILD_BAN_REMOVE', new iUser(session, data));
	})
	
	
	iEvents.on('GUILD_EMOJIS_UPDATE', (socket, data) => {
		// support later maybe
		eEvents.emit('GUILD_EMOJIS_UPDATE', data)
	})
	
	iEvents.on('MESSAGE_REACTION_ADD', (socket, data) => {
		eEvents.emit('MESSAGE_REACTION_ADD', data) // could support fully sometime later
	})
	iEvents.on('MESSAGE_REACTION_REMOVE', (socket, data) => {
		eEvents.emit('MESSAGE_REACTION_REMOVE', data) // could support fully sometime later
	})
	iEvents.on('MESSAGE_REACTION_REMOVE_ALL', (socket, data) => {
		eEvents.emit('MESSAGE_REACTION_REMOVE_ALL', data) // could support fully sometime later
	})
	iEvents.on('CHANNEL_PINS_UPDATE', (socket, data) => {
		eEvents.emit('CHANNEL_PINS_UPDATE', data) // will end up with message_update
	})
	
	// User
	iEvents.on('USER_UPDATE', (socket, data) => {
		if (data.id == session.user.id) {
			var user = new iUser(session, data);
			session.user = user;
			session.users[user.id] = user;
			return;
		}
	})
	
	
	// Voice
	iEvents.on('VOICE_STATE_UPDATE', (socket, data) => {
		//if (classHelper.creator(data.user_id)) console.log('VOICE_STATE_UPDATE', data);
		
		if (data.guild_id) {
			var g = session.guilds[data.guild_id];
			/*
			if (g == undefined) {
				for (var i in session.guilds) {
					var v = session.guilds[i];
					console.log(`${v.name}: ${v.id}`)
				}
				console.log(data);
			}
			*/
			var m = g.members.find(m => m.id == data.user_id)
			if (m) {
				m.deaf = data.deaf;
				m.mute = data.mute;
			}
		}
		
		if (data.user_id == session.user.id) {
			if (session.debug) console.log('B');
			var con = session.voiceConnections[data.guild_id]
			
			if (con != undefined) {
				for (var i in data) con[i] = data[i];
			}
			
		}
		
		if (data.channel_id==null) {
			//if (session.debug) console.log('Someone left a voice call.');
		}
	})
	
	iEvents.on('VOICE_SERVER_UPDATE', (socket, data) => {
		if (session.debug) console.log('C');
		var con = session.voiceConnections.find(c => c.guild_id == data.guild_id);
		if (con != undefined) {
			for (var i in data) con[i] = data[i];
			con.init();
		}
	})
	
	
	// Etc
	iEvents.on('RESUMED', (d) => {
		// idk
	})
	
	
	iEvents.on('RELATIONSHIP_REMOVE', (d) => {
		// idk
	})
	
	
	iEvents.on('USER_SETTINGS_UPDATE', (d) => {
		// idk
	})
	
	
	iEvents.on('PRESENCE_UPDATE', (socket, data) => {
		var user = session.users[data.user.id];
		if (user) {
			for (var i in data.user) {
				user[i] = data.user[i];
			}
		}
		eEvents.emit('PRESENCE_UPDATE', data);
	})
	
	
	iEvents.on('TYPING_START', (socket, data) => {
		eEvents.emit('TYPING_START', data);
	})
	
	
	iEvents.on('ANY', (socket, name, d) => {
		if (iEvents.listenerCount(name)==0) { // i'm not listening to the event, so just chuck it out (after some formatting?).
			if (session.debug) console.log('caught ANY', name, d); // will probably add support later for whatever this is
			eEvents.emit(name, d);
		}
	})
	
	
	
	
	/*
	
	iEvents.on('ANY', (name, d) => {
		//console.log(name);
		if (iEvents.listenerCount(name)==0) { // i'm not listening to the event, so just chuck it out (after some formatting?).
			if (d.user != undefined && d.user.id != undefined) { // something with a user.
				// guildmember?
				if (d.guild_id != undefined) {
					return eEvents.emit(name, new iGuildMember(session, d, session.guilds.find(g => g.id==d.guild_id)))
				}
				
				
				// nothin? probably useless then
				return eEvents.emit(name, new iUser(session, d));
			}
			
			if (session.debug) console.log('caught ANY', name, d); // will probably add support later for whatever this is
			eEvents.emit(name, d);
		}
		
	})
	*/
}








module.exports = discordp;




