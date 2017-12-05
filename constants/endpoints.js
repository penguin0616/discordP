module.exports = {
	baseUrl: "https://discordapp.com",
	gateway: "wss://gateway.discord.gg/?v=6&encoding=json",
	
	login: "/api/v6/auth/login",
	me: "/api/v6/users/@me",
	
	createDM: "/api/v6/users/@me/channels",
	channelPin: "/api/v6/channels/{channel.id}/pins/{message.id}",
	manageMessage: "/api/v6/channels/{channel.id}/messages/{message.id}",
	createMessage: "/api/v6/channels/{channel.id}/messages",
	bulkDelete: "/api/v6/channels/{channel.id}/messages/bulk-delete",
	
	
	modifyGuildMember: "/api/v6/guilds/{guild.id}/members/{user.id}",
	modifyCurrentUsersNick: "/api/v6/guilds/{guild.id}/members/@me/nick"
	
}