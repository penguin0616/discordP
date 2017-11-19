const discordp = require("PATH_TO_MAIN_FOLDER/main.js");

var bot = new discordp({
	debug: true,
	shardId: 1,
	shardCount: 1
});

bot.connect({token: ""}) // can also use {email: "example@example.com", password: "superSecret123"}

bot.events.on('GATEWAY_READY', () => {
	console.log('Logged in as: ' + bot.user.fullName)
})

bot.events.on('MESSAGE_CREATE', (msg) => {
	if (msg.content.startsWith("/ping")==true) {
		msg.channel.sendMessage('pong');
	}
})