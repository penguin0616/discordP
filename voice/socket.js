const ws = require('ws');


class voiceSocket {
	constructor(discord, con) {
		this.discord = discord;
		this.voiceConnection = con;
		this.guildId = con.guild_id;
		this.socket = null;
		// audio encoder
		// audio decoder
		this.speakingQueue = [];
		this.disposed = false;
	}
	get canStream() {
		return this.connected && this.audioTransportSocket;
	}
	get connected() {
		return this.socket && this.socket.connected;
	}
	get connecting() {
		return this.socket && this.socket.connecting;
	}
	get transport() {
		if (this.audioTransportSocket) {
			if (this.audioTransportSocket instanceof VoiceUDP) return "udp";
		}
		return "none";
	}
	
	connect(server, serverId, userId, sessionId, voiceToken) {
		if (this.connected) this.disconnect();
		if (this.disposed) throw new Error("Called 'connect' on disposed VoiceSocket");

		const emitSpeaking = (packet) => {
			console.log('emit voice speak');
			/*
			this.Dispatcher.emit(
				Events.VOICE_SPEAKING,
				{socket: this, data: packet}
				//data.user_id, data.ssrc, data.speaking
			);
			*/
			if (this.audioDecoder) this.audioDecoder.assignUser(packet.ssrc, packet.user_id);
		};

		this.voiceServer = server;
		this.voiceServerURL = "wss://" + server;
		this.socket = new ws(this.voiceServerURL);
		this.socket.on("open", e => {
			console.log('voicesocket_open');
			//this.Dispatcher.emit(Events.VOICESOCKET_OPEN, {socket: this});
			this.identify(serverId, userId, sessionId, voiceToken);
			this.socket._startTimeout(() => {
				return this.disconnect(new DiscordieError(
					Errors.VOICE_SESSION_DESCRIPTION_TIMEOUT
				));
			}, VOICE_SESSION_DESCRIPTION_TIMEOUT);
    });
    this.socket.on("message", e => {
      if (!this.socket) return;

      const msg = JSON.parse(e);
      const op = msg.op;
      const data = msg.d;

      if (op === OPCODE_READY) {
        if (data.heartbeat_interval > 0) {
          this.socket.setHeartbeat(
            () => this.heartbeat(),
            data.heartbeat_interval
          );
        }

        this.Dispatcher.emit(
          Events.VOICE_READY,
          {socket: this, data: data}
        );
      } else if (op === OPCODE_SPEAKING) {
        this.canStream && this.audioTransportSocket.connected ?
          emitSpeaking(data) :
          this.speakingQueue.push(data);
      } else if (op === OPCODE_SESSION_DESCRIPTION) {
        this.socket._stopTimeout();

        if (data.secret_key && data.secret_key.length > 0) {
          const buffer = new ArrayBuffer(data.secret_key.length);
          this.secret = new Uint8Array(buffer);
          for (let i = 0; i < this.secret.length; i++) {
            this.secret[i] = data.secret_key[i];
          }
        }

        if (this.canStream) {
          this.Dispatcher.emit(
            Events.VOICE_SESSION_DESCRIPTION,
            {socket: this, data: data}
            //data.secret_key, data.mode
          );

          this.speakingQueue.forEach(packet => emitSpeaking(packet));
          this.speakingQueue.length = 0;

          // required to start receiving audio from other users
          this.audioTransportSocket.sendSenderInfo();
        }
      }
    });

    const close = (code, desc) => this.disconnect(code, desc, true);
    this.socket.on("close", close);
    this.socket.on("error", close);
  }
	
}






module.exports = voiceSocket;