const baseSocket = require('./baseSocket.js');
const classHelper = require('../classes/classHelper.js');
const constants = classHelper.constants();
const endpoints = classHelper.endpoints();
const ops = constants.GATEWAY_OPCODE

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

class gateway extends baseSocket {
	constructor(discord, shard) {
		var server = endpoints.gateway;
		super(discord, server);
		this.type = 'gateway';
		this.shard = shard;
		
		classHelper.setHiddenProperty(this, 'socket', this.newSocket())
		
		connect(this);
	}
}


function connect(session, reconnecting) {
	session.socket.on('open', () => {
		session.connected = true;
	})
	
	session.socket.on('message', (rawData) => {
		// unpack
		rawData = session.unpack(rawData);
		var data = JSON.parse(rawData);
		if (data.s != null) session.seq = data.s;
		
		if (data.op == ops.HELLO) {
			//console.log(`[Gateway[${session.shard}]]: Hello.`);
			session.identify();
			
			session.heartbeat_interval = data.d.heartbeat_interval
		} else if (data.op == ops.HEARTBEAT_ACK) {
			// yay
			
			
			
		} else if (data.op == ops.INVALID_SESSION) {
			/*
			if (data.d == false) {
				setTimeout(function() {session.identify()}, 3);
				if (session.discord.debug) console.log(`[gateway[${session.shard}]]: INVALID_SESSION received, and we are unable to resume. Identifying soon.`);
				return;
			}
			setTimeout(function() {session.resume()}, 3);
			if (session.discord.debug) console.log(`[gateway[${session.shard}]]: INVALID_SESSION received, but we are able to resume. Resuming soon.`);
			*/
			console.log(`[Gateway[${session.shard}]]: Invalid session.`);
			
			
			
		} else if (data.op == ops.HEARTBEAT) {
			session.ping();
			
			
			
		} else if (data.op == ops.DISPATCH) {
			// here we go
			session.discord.internal.events.emit(data.t, session, data.d);
			session.discord.internal.events.emit('ANY', session, data.t, data.d);
			
			
			
		} else {
			console.log(`[Gateway[${session.shard}]]: unrecognized op:`, data);
		}
		
		/*
		// handle
		if (data.op == ops.HELLO) {
			if (reconnecting==true)
				session.resume();
			else
				session.identify();
			
			session.heartbeat_interval = data.d.heartbeat_interval
			
		} else if (data.op == ops.HEARTBEAT_ACK) {
			// yay
			
			
			
		} else if (data.op == ops.INVALID_SESSION) {
			if (data.d == false) {
				setTimeout(function() {session.identify()}, 3);
				if (session.discord.debug) console.log(`[gateway[${session.shard}]]: INVALID_SESSION received, and we are unable to resume. Identifying soon.`);
				return;
			}
			setTimeout(function() {session.resume()}, 3);
			if (session.discord.debug) console.log(`[gateway[${session.shard}]]: INVALID_SESSION received, but we are able to resume. Resuming soon.`);
			
			
			
		} else if (data.op == ops.HEARTBEAT) {
			// my heart is beating
			session.ping();
			
			
			
		} else if (data.op == ops.DISPATCH) {
			// here we go
			session.discord.internal.events.emit('ANY', session, data.t, data.d);
			session.discord.internal.events.emit(session, data.t, data.d);
			
			
			
		} else {
			console.log(`[gateway[${session.shard}]]: unrecognized op:`, data);
		}
		*/
	})
	
	session.socket.on("close", function(code) {
		session.connected = false;
		if (session.discord.debug) console.log("[gateway close]: Connection failed:", code);
		

		/*
		
		if (session.discord.autoReconnect==true) {
			if (session.discord.debug) console.log('AutoReconnect enabled: reconnecting');
			setTimeout(function() {
				classHelper.setHiddenProperty(session, 'socket', session.newSocket())
				connect(session, true);
			}, session.discord.reconnectDelay)
		}
		*/
	})
	
	session.socket.on("error", function(err) {
		session.connected = false;
		if (session.discord.debug) console.log("[gateway error]: Socket errored");
	})
}

module.exports = gateway;







/*

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



*/