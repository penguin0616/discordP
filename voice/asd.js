const webSocket = require('ws');
const pako = require("../constants/pako/index.js");
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();
const endpoints = classHelper.endpoints();
const os = require('os');

/*

function connect() {
	ws.on('open', function() {
		session.connected = true;
	})
	
	ws.on('message', function(rawData) {
		const isBlob = (rawData instanceof Buffer || rawData instanceof ArrayBuffer);
		if (isBlob) rawData = pako.inflate(rawData, {to: "string"});
		var data = JSON.parse(rawData);
		
		
		
	})
	
	ws.on("close", function(code) {
		session.connected = false;
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

*/