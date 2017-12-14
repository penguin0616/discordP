const webSocket = require('ws');
const baseSocket = require("../networking/baseSocket.js");
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();
const endpoints = classHelper.endpoints();
const ops = constants.VOICE_OPCODE

/*
Code	Name				Sent By				Description
0		Identify			client				begin a voice websocket connection
1		Select Protocol		client				select the voice protocol
2		Ready				server				complete the websocket handshake
3		Heartbeat			client				keep the websocket connection alive
4		Session Description	server				describe the session
5		Speaking			client and server	indicate which users are speaking
6		Heartbeat ACK		server				sent immediately following a received client heartbeat
7		Resume				client				resume a connection
8		Hello				server				the continuous interval in milliseconds after which the client should send a heartbeat
9		Resumed				server				acknowledge Resume
13		Client Disconnect	server				a client has disconnected from the voice channel
*/


class voiceSocket extends baseSocket {
	constructor(connection) {
		var baseServer = connection.endpoint.replace(/\:\d+/,"")
		super(connection.discord, `wss://${baseServer}/?v=3&encoding=json`);
		this.type = 'voice';
		this.baseServer = baseServer;
		this.connection = connection;

		this.socket = this.newSocket();
		connect(this);
	}
	
	get guild_id() { return this.connection.guild_id }
	get channel_id() { return this.connection.channel_id }
	get user_id() { return this.connection.user_id }
	get session_id() { return this.connection.session_id }
}

function connect(session, reconnecting) {
	console.log('server:', session.server);
	
	session.socket.on('open', () => {
		session.connected = true;
		console.log('opened');
	})
	
	session.socket.on('message', (rawData) => {
		// unpack
		rawData = session.unpack(rawData);
		var data = JSON.parse(rawData);
		if (data.s != null) session.seq = data.s;
		
		// handle
		if (data.op == ops.HELLO) {
			if (reconnecting) session.resume();
			else session.identify();
		} else console.log("[voiceSocket]: unrecognized op:", data);

		
	})
	
	session.socket.on("close", function(code) {
		session.connected = false;
		console.log('closed:', code);
	})
	session.socket.on("error", function(err) {
		session.connected = true;
		console.log('error:', err);
	})
}






module.exports = voiceSocket;



/*

class gateway {
	constructor(connection, shard, maxShards) {
		console.log('begin');
		this.session = connection.discord;
		this.server = "wss://" + connection.endpoint.replace(/\:\d+/,"") + "/?v=3&encoding=json"
		
		console.log(this.server);
		
		var ws = new webSocket(this.server);
		
		ws.on('open', () => {
			console.log('opened');
			var identify = {
				"op": constants.OPCODE.IDENTIFY,
				"d": {
					"token": connection.discord.internal.token,
					"properties": {
						"$os": os.platform(),
						"$browser": "discordP",
						"$device": "discordP"
					},
					"compress": true,
					"large_threshold": 250,
					"shard": [connection.discord.shardId-1, connection.discord.shardCount]
				}
			}
			
			ws.send(JSON.stringify(identify));
		})
		
		ws.on('message', (rawData) => {
			const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
			if (isBlob) rawData = pako.inflate(rawData, {to: "string"});
			var data = JSON.parse(rawData);
			console.log(data);
		})
		
		ws.on("close", function(code) {
			console.log('closed:', code);
		})
		ws.on("error", function(err) {
			console.log('error:', err);
		})
		
	}
}

module.exports = gateway;
*/


