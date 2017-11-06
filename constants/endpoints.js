module.exports = {
	baseUrl: "https://discordapp.com",
	gateway: "wss://gateway.discord.gg/?v=6&encoding=json",
	
	login: "/api/v6/auth/login",
	me: "/api/v6/users/@me",
	createDM: "/api/v6/users/@me/channels",
	deleteMessage: "/api/v6/channels/{channel.id}/messages/{message.id}",
	channelPin: "/api/v6/channels/{channel.id}/pins/{message.id}"
	
	
}