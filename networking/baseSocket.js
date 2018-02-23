const webSocket = require('ws');
const os = require('os');
const pako = require("../constants/pako/index.js");
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();

function createSocket(session) {
	var sock = new webSocket(session.server);
	return sock;
	
	/*
	session.socket.on('close', (code) => {
		session.connected = false;
		if (discord.debug) {
			console.log(`$[${this.type}]: Socket failed:`, err);
		}
		if (session.type == 'gateway' && discord.autoReconnect==true) {
			setTimeout(function() {
				createSocket(session);
			}, discord.reconnectDelay)
		} else if (session.type == 'voice'
	})
	*/
	
	
}

class baseSocket {
	constructor(discord, server) {
		this.discord = discord;
		this.connected = false;
		this.seq = 0;
		this.server = server;
	}
	
	unpack(fat) {
		const isBlob = (fat instanceof Buffer || fat instanceof ArrayBuffer);
		if (isBlob) fat = pako.inflate(fat, {to: "string"});
		return fat;
	}
	
	newSocket() {
		return createSocket(this);
	}
	
	send(packet) {
		if (this.connected == false) {
			if (this.discord.debug) console.log(`[${this.type}]: Dumped a packet:`, packet);
			return false;
		}
		if (typeof(packet) != 'string') packet = JSON.stringify(packet);
		this.socket.send(packet);
		return true;
	}
	
	ping() {
		this.seq++;
		var heartbeat = {
			"op": constants[this.type.toUpperCase() + '_OPCODE'].HEARTBEAT,
			"d": this.seq
		}
		this.seq++;
		this.send(heartbeat);
	}
	
	identify() {
		var identify
		if (this.type == 'gateway') {
			identify = {
				"op": constants.GATEWAY_OPCODE.IDENTIFY,
				"d": {
					"token": this.discord.internal.token,
					"properties": {
						"$os": os.platform(),
						"$browser": "discordP",
						"$device": ""
					},
					"compress": true,
					"large_threshold": 250,
					"shard": [this.shard, this.discord.shardCount]
				}
			}
		} else if (this.type == 'voice') {
			identify = {
				"op": constants.VOICE_OPCODE.IDENTIFY,
				"d": {
					"server_id": this.guild_id,
					"user_id": this.user_id,
					"session_id": this.session_id,
					"token": this.connection.token//this.discord.internal.token
				}
			}
		} else {
			console.log("fat", this);
			throw 'attempt to identify a baseSocket';
		}
		
		this.send(identify);
		if (this.discord.debug) {console.log(`Sent a ${this.type} Identify`);}
	}
	
	resume() {
		var resume
		if (this.type == 'gateway') {
			resume = {
				"op": constants.GATEWAY_OPCODE.RESUME,
				"d": {
					"token": this.discord.internal.token,
					"session_id": this.discord.session_id,
					"seq": this.seq
				}
			}
		} else if (this.type == 'voice') {
			resume = {
				"op": constants.VOICE_OPCODE.RESUME,
				"d": {
					"server_id": this.server_id,
					"session_id": this.session_id,
					"token": this.discord.internal.token
				}
			}
		} else throw 'attempt to resume a baseSocket';
		
		this.send(resume);
		console.log(`Sent a ${this.type} Resume`);
	}
	/*
	inspect() {
		if (this.type == undefined) return 'baseSocket';
		return "Socket: " + this.type
	}
	*/
}

module.exports = baseSocket;




