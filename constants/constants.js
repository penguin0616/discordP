module.exports = {
	CHANNELS: {
		TEXT: 0,
		DM: 1,
		VOICE: 2,
		GROUP_DM: 3,
		CATEGORY: 4
	},
	RELATIONSHIPS: {
		FRIEND: 1,
		BLOCKED: 2
	},
	GATEWAY_OPCODE: {
		DISPATCH: 0,
		HEARTBEAT: 1,
		IDENTIFY: 2,
		STATUS_UPDATE: 3,
		VOICE_STATE_UPDATE: 4,
		VOICE_SERVER_PING: 5,
		RESUME: 6,
		RECONNECT: 7,
		REQUEST_GUILD_MEMBERS: 8,
		INVALID_SESSION: 9,
		HELLO: 10,
		HEARTBEAT_ACK: 11
	},
	VOICE_OPCODE: {
		IDENTIFY: 0,
		SELECT_PROTOCOL: 1,
		READY: 2,
		HEARTBEAT: 3,
		SESSION_DESCRIPTION: 4,
		SPEAKING: 5,
		HEARTBEAT_ACK: 6,
		RESUME: 7,
		HELLO: 8,
		RESUMED: 9,
		CLIENT_DISCONNECT: 13
	},
	PERMISSIONS: {
		GENERAL: {
			CreateInstantInvite: 0x1,
            KickMembers: 0x2,
            BanMembers: 0x4,
            Administrator: 0x8,
            ManageChannels: 0x10,
            ManageServer: 0x20,
            ChangeNickname: 0x4000000,
            ManageNicknames: 0x8000000,
            ManageRoles: 0x10000000,
            ManageWebhooks: 0x20000000,
            ManageEmojis: 0x40000000,
            ViewAuditLog: 0x80
		},
		TEXT: {
            AddReactions: 0x40,
            ReadMessages: 0x400,
            SendMessages: 0x800,
            SendTTSMessages: 0x1000,
            ManageMessages: 0x2000,
            EmbedLinks: 0x4000,
            AttachFiles: 0x8000,
            ReadMessageHistory: 0x10000,
            MentionEveryone: 0x20000,
            UseExternalEmojis: 0x40000
		},
		VOICE: {
            ViewChannel: 0x400,
            Connect: 0x100000,
            Speak: 0x200000,
            MuteMembers: 0x400000,
            DeafenMembers: 0x800000,
            MoveMembers: 0x1000000,
            UseVAD: 0x2000000
		}
	}
}
