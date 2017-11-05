const webSocket = require('ws');
const pako = require('pako');
const iUser = require("../classes/iUser.js");
const iMessage = require("../classes/iMessage.js");
const time = require("../../time.js");

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

var lastSeq = 0;
function startGateway() {
	var discord = require("../main.js").discord();

	var ws = new webSocket("wss://gateway.discord.gg/?v=6&encoding=json");

	ws.on('open', function() {
		//console.log("Opened websocket");
	})
	ws.on('message', function(rawData) {
		const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
		
		if (isBlob) {
			rawData = pako.inflate(rawData, {to: "string"});
		}
			
		data = JSON.parse(rawData);
		if (data.s != null) lastSeq = data.s;
		
		if (data.op == 10) {
			var toSend = {
				"op": 2,
				"d": {
					"token": discord.token,
					"properties": {
						"$os": "linux",
						"$browser": "disco",
						"$device": "disco"
					},
					"compress": true,
					"large_threshold": 250,
					"shard": [0,1],
					"presence": {
						"game": {
							"name": "tryna write a discord lib",
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
					"op": 1,
					"d": lastSeq
				})
				ws.send(heartbeat)
				lastSeq++
			}, data.d.heartbeat_interval)

			
			console.log("Identified to Discord.");
			return;
			
		} else if (data.op == 11) {
			// they ack'd our heartbeat ping
			return;
		
		} else if (data.op == 0) { // dispatch
			/*
			if (data.t == 'PRESENCE_UPDATE') return;
			else if (data.t == 'MESSAGE_ACK') return;
			else if (data.t == 'MESSAGE_CREATE') {
				discord.events.emit("MESSAGE_CREATE", data.d)
				return;
			} else if (data.t == 'READY') {
				
				return;
			}
			*/
			
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
				GUILD_DELETE:true
			}
			if (no[data.t]==undefined) console.log(data.t)
			
			discord.events.emit('ANY', data.t, data.d);
			discord.events.emit(data.t, data.d);
			
			
		}
		
		
		//console.log('Message:', data);
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