const classHelper = require('./classHelper.js');
const iBase = require('./iBase.js');
const permissions = classHelper.constants().PERMISSIONS;
const channels = classHelper.constants().CHANNELS;

// i don't know how to handle permission bits
// so some of this might looks familiar

/*
has(permission, checkAdmin = true) {
    if (permission instanceof Array) return permission.every(p => this.has(p, checkAdmin));
    permission = this.constructor.resolve(permission);
    if (checkAdmin && (this.bitfield & this.constructor.FLAGS.ADMINISTRATOR) > 0) return true;
    return (this.bitfield & permission) === permission;
}
serialize(checkAdmin = true) {
    const serialized = {};
    for (const perm in this.constructor.FLAGS) serialized[perm] = this.has(perm, checkAdmin);
    return serialized;
}
*/
/*

        var perms = {
            // General
            generalCreateInstantInvite: 0x1,
            generalKickMembers: 0x2,
            generalBanMembers: 0x4,
            generalAdministrator: 0x8,
            generalManageChannels: 0x10,
            generalManageServer: 0x20,
            generalChangeNickname: 0x4000000,
            generalManageNicknames: 0x8000000,
            generalManageRoles: 0x10000000,
            generalManageWebhooks: 0x20000000,
            generalManageEmojis: 0x40000000,
            generalViewAuditLog: 0x80,
            // Text
            textAddReactions: 0x40,
            textReadMessages: 0x400,
            textSendMessages: 0x800,
            textSendTTSMessages: 0x1000,
            textManageMessages: 0x2000,
            textEmbedLinks: 0x4000,
            textAttachFiles: 0x8000,
            textReadMessageHistory: 0x10000,
            textMentionEveryone: 0x20000,
            textUseExternalEmojis: 0x40000,
            // Voice
            voiceViewChannel: 0x400,
            voiceConnect: 0x100000,
            voiceSpeak: 0x200000,
            voiceMuteMembers: 0x400000,
            voiceDeafenMembers: 0x800000,
            voiceMoveMembers: 0x1000000,
            voiceUseVAD: 0x2000000
        };
        var darkTheme = true;

        function swapTheme() {
            darkTheme = !darkTheme;
            if(darkTheme) {
                document.body.className = "";
            } else {
                document.body.className = "light";
            }
        }

        function recalculate(element, perm, noSet) {
            if(element) {
                if(element.id === "textReadMessages") {
                    document.getElementById("voiceViewChannel").checked = element.checked;
                }
                if(element.id === "voiceViewChannel") {
                    document.getElementById("textReadMessages").checked = element.checked;
                }
            }
            var perm = perm || 0;
            var eq = [];
            for(var key in perms) {
                if(key !== "voiceViewChannel" && document.getElementById(key).checked) {
                    perm += perms[key];
                    eq.push("0x" + perms[key].toString(16));
                }
            }
            eq = " = " + eq.join(" | ")
            document.getElementById("number").innerHTML = "" + perm;
            document.getElementById("equation").innerHTML = perm + eq;

            if(!noSet) {
                setHash("" + perm);
            }

            if(document.getElementById("clientID").value) {
                var clientID = document.getElementById("clientID").value;
                var ok = clientID.match(/^\d{17,18}$/);
                if(ok) {
                    document.getElementById("clientID").className = "success";
                    document.getElementById("invite").className = "";
                } else {
                    document.getElementById("clientID").className = "error";
                    document.getElementById("invite").className = "disabled";
                }

                var scopes = document.getElementById("oauthScopes").value;
                if(scopes) {
                    scopes = encodeURIComponent(scopes.trim());
                } else {
                    scopes = "bot";
                }

                var url = "https://discordapp.com/oauth2/authorize?client_id=" + clientID +
                    "&scope=" + scopes +
                    "&permissions=" + perm;

                if(document.getElementById("oauthCodeGrant").checked) {
                    url += "&response_type=code"
                }
                if(document.getElementById("oauthRedirect").value) {
                    url += "&redirect_uri=" + encodeURIComponent(document.getElementById("oauthRedirect").value);
                }

                document.getElementById("invite").innerHTML = document.getElementById("invite").href = url;
            } else {
                document.getElementById("clientID").className = "error";
                document.getElementById("invite").className = "disabled";
                document.getElementById("invite").innerHTML = "https://discordapp.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=" + (perm + "").split("=")[0].trim();
                document.getElementById("invite").href = "#";
            }
        }

        function getHash(hash) {
            hash = hash || window.location.hash;
            if(hash && hash.length > 1) {
                return hash.substring(1);
            } else {
                return null;
            }
        }

        function setHash(data) {
            if(history.pushState) {
                history.pushState(null, null, "#" + data);
            } else {
                window.location.hash = "#" + data;
            }
        }

        window.onpopstate = function(event) {
            syncCheckboxes(+getHash(event.target.location.hash));
            recalculate(null, null, true);
        }

        function syncCheckboxes(perm) {
            for(let key in perms) {
                if(perm & perms[key]) {
                    document.getElementById(key).checked = true;
                }
            }
        }

        syncCheckboxes(+getHash());
        recalculate(null, null, true);
    
*/

const specifics = {
	iTextChannel: {
		CreateInstantInvite: true,
		ManageChannel: true,
		ManagePermissions: true,
		ManageWebhooks: true
	},
	iVoiceChannel: {
		
	},
	iRole: {}
}

class iPermissions extends iBase {
	constructor(discord, permission, source) {
		super(discord);
		
		classHelper.setHiddenProperty(this, 'permission', permission);
		
		// iRole.permissions
		// iChannel.permission_overwrites [ {type: 'role', id: ..., allow: ..., deny: ...} ]
		
		for (let type in permissions) {
			if ((source == 'iVoiceChannel' && type != 'TEXT') || (source == 'iTextChannel' && type != 'VOICE') || source == 'iRole') {
				this[type] = {};
				for (var perm in permissions[type]) {
					
					const bit = permissions[type][perm]
					Object.defineProperty(this[type], perm, {
						enumerable: true,
						get: () => (this.permission & bit) === bit,
						set: (v) => v ? (this.permission |= bit) : (this.permission &= ~bit)
					});
					
					
					
				} 
			}
		}
	}
	
	inspect() {
		return JSON.parse(JSON.stringify(this))
	}
}






/*
var typicalChannel = function(a) {
	// ManageRoles appears to be ManagePermissions
	a.KickMembers = true;
	a.BanMembers = true;
	a.Administrator = true;
	a.ManageServer = true;
	a.ChangeNickname = true;
	a.ManageNicknames = true;
	a.ManageEmojis = true;
	a.ViewAuditLog = true;
}
	
class iPermissions extends iBase {
	constructor(raw, superType) {
		super(raw);
		classHelper.setHiddenProperty(this, 'raw', raw || 0);
		
		var bigX = "";
		var littleX = {};
		
		if (superType == CHANNELS.TEXT) {
			bigX = 'VOICE';
			typicalChannel(littleX);
		} else if (superType == CHANNELS.VOICE) {
			bigX = 'TEXT';
			typicalChannel(littleX);
		}
		
		for (let type in PERMISSIONS) {
			if (type != bigX) {
				this[type] = {}
				for (let permission in PERMISSIONS[type]) {
					if (littleX[permission] != true) {
						const bit = PERMISSIONS[type][permission];
						Object.defineProperty(this[type], permission, {
							enumerable: true,
							get: () => (this.raw & bit) === bit,
							set: (v) => v ? (this.raw |= bit) : (this.raw &= ~bit)
						});
					}
				}
			}
		}
	}
	
	inspect() { return JSON.parse(JSON.stringify(this)); }
}
*/


module.exports = iPermissions;






// permission thing at: https://discordapp.com/developers/docs/topics/permissions



/*
Bitwise Permission 	Flags
Permission				Value		Description
CREATE_INSTANT_INVITE	0x00000001	Allows creation of instant invites
KICK_MEMBERS *			0x00000002	Allows kicking members
BAN_MEMBERS *			0x00000004	Allows banning members
ADMINISTRATOR *			0x00000008	Allows all permissions and bypasses channel permission overwrites
MANAGE_CHANNELS *		0x00000010	Allows management and editing of channels
MANAGE_GUILD *			0x00000020	Allows management and editing of the guild
ADD_REACTIONS			0x00000040	Allows for the addition of reactions to messages
VIEW_AUDIT_LOG			0x00000080	Allows for viewing of audit logs
READ_MESSAGES			0x00000400	Allows reading messages in a channel. The channel will not appear for users without this permission
SEND_MESSAGES			0x00000800	Allows for sending messages in a channel
SEND_TTS_MESSAGES		0x00001000	Allows for sending of /tts messages
MANAGE_MESSAGES *		0x00002000	Allows for deletion of other users messages
EMBED_LINKS				0x00004000	Links sent by this user will be auto-embedded
ATTACH_FILES			0x00008000	Allows for uploading images and files
READ_MESSAGE_HISTORY	0x00010000	Allows for reading of message history
MENTION_EVERYONE		0x00020000	Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel
USE_EXTERNAL_EMOJIS		0x00040000	Allows the usage of custom emojis from other servers
CONNECT					0x00100000	Allows for joining of a voice channel
SPEAK					0x00200000	Allows for speaking in a voice channel
MUTE_MEMBERS			0x00400000	Allows for muting members in a voice channel
DEAFEN_MEMBERS			0x00800000	Allows for deafening of members in a voice channel
MOVE_MEMBERS			0x01000000	Allows for moving of members between voice channels
USE_VAD					0x02000000	Allows for using voice-activity-detection in a voice channel
CHANGE_NICKNAME			0x04000000	Allows for modification of own nickname
MANAGE_NICKNAMES		0x08000000	Allows for modification of other users nicknames
MANAGE_ROLES *			0x10000000	Allows management and editing of roles
MANAGE_WEBHOOKS *		0x20000000	Allows management and editing of webhooks
MANAGE_EMOJIS *			0x40000000	Allows management and editing of emojis
*/








