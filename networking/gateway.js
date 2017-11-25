const webSocket = require('ws');
const pako = require("../constants/pako/index.js");
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();
const endpoints = classHelper.endpoints();

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

class gateway {
	constructor(discord, shard, maxShards) {
		var ws = new webSocket(endpoints.gateway);
		
		this.connected = false;
		this.sequenceNumber = 0;
		
		var _this = this;
		
		ws.on('open', function() {
			_this.connected = true;
		})
		
		ws.on('message', function(rawData) {
			const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
			if (isBlob) { // took a while to figure out that the "massive buffer" was actually the 'READY' dispatch
				rawData = pako.inflate(rawData, {to: "string"});
			}
			var data = JSON.parse(rawData);
			if (data.s != null) _this.sequenceNumber = data.s;
			
			if (data.op == constants.OPCODE.HELLO) {
				var identify = {
					"op": constants.OPCODE.IDENTIFY,
					"d": {
						"token": discord.internal.token,
						"properties": {
							"$os": 'win32',
							"$browser": "discordP",
							"$device": "discordP"
						},
						"compress": true,
						"large_threshold": 250,
						"shard": [shard-1, maxShards]
					}
				}
				
				_this.send(identify);
				_this.heartbeat_interval = data.d.heartbeat_interval
				
				if (discord.debug) console.log('Identified to Discord');
			} else if (data.op == constants.OPCODE.HEARTBEAT_ACK) {
				// they ack'd our heartbeat ping
				return;
			} else if (data.op == constants.OPCODE.INVALID_SESSION) {
				throw "Attempted to connect to Discord gateway with an invalid session. Can be caused by a invalid token, but usually just a quick bug. Restarting the bot should fix it.";
				
			} else if (data.op == constants.OPCODE.HEARTBEAT) {
				_this.ping();
			} else if (data.op == constants.OPCODE.DISPATCH) { // dispatch
				discord.internal.events.emit('ANY', data.t, data.d);
				discord.internal.events.emit(data.t, data.d);
			}
		})
		
		ws.on("close", function(code, data) {
			_this.connected = false;
			if (discord.debug) console.log('Close:', code, data)
		})
		ws.on("error", function(code, data) {
			_this.connected = false;
			if (discord.debug) console.log('Error:', code, data)
		})
		
		this.socket = ws;
	}
	
	send(data) {
		if (this.connected == false) throw 'gateway disconnected!'; // not connected
		//if (data.s == undefined) {this.sequenceNumber++; data.s = this.sequenceNumber};
		this.socket.send(JSON.stringify(data));
	}
	
	ping() {
		this.sequenceNumber++
		var heartbeat = {
			"op": constants.OPCODE.HEARTBEAT,
			"d": this.sequenceNumber
		}
		this.sequenceNumber++
		this.send(heartbeat)
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