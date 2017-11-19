const discordp = require("PATH_TO_MAIN_FOLDER/main.js");

var bot = new discordp({
	debug: true,
	shardId: 1,
	shardCount: 1
});

bot.connect({token: ""})
// If you're trying to use a selfbot (not always a great idea) and have no idea how to get your token, follow these steps.
// 1: log in on the discord client
// 2: pop open the web inspector (ctrl/cmd shift I)
// 3: type localStorage.token in the console to get your auth token.
// 4: connect with that token

bot.events.on('GATEWAY_READY', () => {
	console.log('Logged in as: ' + bot.user.fullName)
})

bot.events.on('MESSAGE_CREATE', (msg) => {
	if (msg.content.startsWith("/ping")==true) {
		msg.channel.sendMessage('pong');
	}
})