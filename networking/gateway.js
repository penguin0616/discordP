const webSocket = require('ws');
const pako = require("../constants/pako/index.js");
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();
const endpoints = classHelper.endpoints();
const os = require('os');

/*
Gateway Opcodes
Code	Name					Client Action		Description

0		Dispatch				Receive				dispatches an event
1		Heartbeat				Send/Receive		used for ping checking
2		Identify				Send				used for client handshake
3		Status Update			Send				used to update the client status
4		Voice State 			Update				Send	used to join/move/leave voice channels
5		Voice Server			Ping				Send	used for voice ping checking
6		Resume					Send				used to resume a closed connection
7		Reconnect				Receive				used to tell clients to reconnect to the gateway
8		Request Guild Members	Send				used to request guild members
9		Invalid 				Session				Receive	used to notify client they have an invalid session id
10		Hello					Receive				sent immediately after connecting, contains heartbeat and server debug information
11		Heartbeat ACK			Receive				sent immediately following a client heartbeat that was received
*/

function connect(discord, shard, maxShards, session, ws, reconnectInfo) {
	ws.on('open', function() {
		session.connected = true;
	})
	
	ws.on('message', function(rawData) {
		const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
		if (isBlob) rawData = pako.inflate(rawData, {to: "string"});
		
		var data = JSON.parse(rawData);
		if (data.s != null) session.sequenceNumber = data.s;
			
		if (data.op == constants.OPCODE.HELLO) {
			if (reconnectInfo != undefined) {
				var resume = {
					"op": constants.OPCODE.RESUME,
					"d": {
						"token": discord.internal.token,
						"session_id": discord.session_id,
						"seq": session.sequenceNumber
					}
				}
				session.send(resume)
				if (discord.debug) console.log('Resumed session');
			} else {
				var identify = {
					"op": constants.OPCODE.IDENTIFY,
					"d": {
						"token": discord.internal.token,
						"properties": {
							"$os": os.platform(),
							"$browser": "discordP",
							"$device": "discordP"
						},
						"compress": true,
						"large_threshold": 250,
						"shard": [shard-1, maxShards]
					}
				}
					
				session.send(identify);
				if (discord.debug) console.log('Sent \'Identify\' to Discord');
			}
			session.heartbeat_interval = data.d.heartbeat_interval
		} else if (data.op == constants.OPCODE.HEARTBEAT_ACK) {
			// they ack'd our heartbeat ping
			return;
		} else if (data.op == constants.OPCODE.INVALID_SESSION) {
			//throw "Attempted to connect to Discord gateway with an invalid session. That's not good.";
			setTimeout(function() {
				var identify = {
					"op": constants.OPCODE.IDENTIFY,
					"d": {
						"token": discord.internal.token,
						"properties": {
							"$os": os.platform(),
							"$browser": "discordP",
							"$device": "discordP"
						},
						"compress": true,
						"large_threshold": 250,
						"shard": [shard-1, maxShards]
					}
				}
					
				session.send(identify);
			}, 5);
			console.log('Attempted to connect with an invalid session; retrying...');
		} else if (data.op == constants.OPCODE.HEARTBEAT) {
			session.ping();
			
		} else if (data.op == constants.OPCODE.DISPATCH) {
			discord.internal.events.emit('ANY', data.t, data.d);
			discord.internal.events.emit(data.t, data.d);
			
		} else {
			if (discord.debug) console.log("unknown opcode:", data);
		}
	})
	
	ws.on("close", function(code) {
		session.connected = false;
		if (discord.debug) {
			var err = code;
			console.log("Gateway connection failed;", err);
		}
		if (discord.autoReconnect==true) {
			setTimeout(function() {
				restart(discord, shard, maxShards, session);
			}, discord.reconnectDelay)
		}
	})
	ws.on("error", function(err) {
		session.connected = false;
		if (discord.debug) console.log('Error:', err);
	})
}

function restart(discord, shard, maxShards, session) {
	var ws = new webSocket(endpoints.gateway);
	
	session.socket = ws;
	
	connect(discord, shard, maxShards, session, ws, true)
	
	return ws;
}

class gateway {
	constructor(discord, shard, maxShards) {
		var dis = this;

		// socket
		var ws = new webSocket(endpoints.gateway);
		
		dis.discord = discord;

		// session
		
		// basic
		dis.connected = false;
		dis.sequenceNumber = 0;
		dis.socket = ws;
		
		connect(discord, shard, maxShards, dis, ws)
	}
	
	send(data) {
		if (this.connected == false) {
			if (this.discord.debug) console.log('dumped a packet that tried to get sent:', data);
			//throw 'gateway disconnected!';
			return false;
		}
		this.socket.send(JSON.stringify(data));
		return true;
	}
	
	ping() {
		if (this.connected == false) return;
		this.sequenceNumber++
		var heartbeat = {
			"op": constants.OPCODE.HEARTBEAT,
			"d": this.sequenceNumber
		}
		this.sequenceNumber++
		this.send(heartbeat)
	}
	
	inspect() {
		return 'no u';
	}
}

module.exports = gateway;





/*
var lastSeq = 0;
function startGateway() {
	var discord = classHelper.discord();

	var ws = new webSocket("wss://gateway.discord.gg/?v=6&encoding=json");

	ws.on('open', function() {
		//console.log("Opened websocket");
	})
	ws.on('message', function(rawData) {
		const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
		if (isBlob) { // took a while to figure out that the "massive buffer" was actually the 'READY' dispatch
			rawData = pako.inflate(rawData, {to: "string"});
		}
		
		
		data = JSON.parse(rawData);
		if (data.s != null) lastSeq = data.s;
		if (data.op == constants.OPCODE.HELLO) { // they said hi to us, send them some info
			var toSend = {
				"op": constants.OPCODE.IDENTIFY,
				"d": {
					"token": discord.token,
					"properties": {
						"$os": "linux", // not really
						"$browser": "disco", // not really
						"$device": "disco" // not really
					},
					"compress": true,
					"large_threshold": 250,
					"shard": [0,1]
					"presence": {
						"game": {
							"name": "writing discord library - currently doing class methods",
							"type": 0
						},
						"status": "dnd",
						"since": 91879201,
						"afk": false
					}
				}
			}
			ws.send(JSON.stringify(toSend));
			setInterval(function() {
				lastSeq++
				var heartbeat = JSON.stringify({
					"op": constants.OPCODE.HEARTBEAT,
					"d": lastSeq
				})
				ws.send(heartbeat)
				lastSeq++
			}, data.d.heartbeat_interval)
			console.log("Identified to Discord.");
			return;
			
		} else if (data.op == constants.OPCODE.HEARTBEAT_ACK) {
			// they ack'd our heartbeat ping
			return;
		
		} else if (data.op == constants.OPCODE.DISPATCH) { // dispatch
			var no = {
				READY:true,
				MESSAGE_CREATE:true,
				PRESENCE_UPDATE:true,
				MESSAGE_ACK:true,
				GUILD_MEMBER_ADD:true,
				GUILD_MEMBER_REMOVE:true,
				TYPING_START:true,
				MESSAGE_UPDATE:true,
				MESSAGE_DELETE:true,
				CHANNEL_PINS_UPDATE:true,
				CHANNEL_PINS_ACK:true,
				MESSAGE_DELETE_BULK:true,
				MESSAGE_REACTION_ADD:true,
				MESSAGE_REACTION_REMOVE:true,
				GUILD_MEMBER_UPDATE:true,
				CHANNEL_DELETE:true,
				CHANNEL_CREATE:true,
				GUILD_BAN_ADD:true,
				GUILD_BAN_REMOVE:true,
				GUILD_CREATE:true,
				GUILD_DELETE:true,
				VOICE_STATE_UPDATE:true
			}
			if (no[data.t]==undefined) console.log(data.t)
			
			discord.events.emit('ANY', data.t, data.d);
			discord.events.emit(data.t, data.d);
			
			
		}
	})

	ws.on("close", function(code, data) {
		console.log('Close:', code, data)
	})
	ws.on("error", function(code, data) {
		console.log('Error:', code, data)
	})
	return ws
}

module.exports = startGateway;
*/