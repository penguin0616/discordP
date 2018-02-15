const discordp = require("PATH_TO_MAIN_FOLDER/index.js");

var bot = new discordp({
	debug: true, // helpful if you find a bug and wanna report it or somthn
	shardCount: 1
});

bot.connect({token: ""})

bot.events.on('GATEWAY_READY', () => {
	console.log('Logged in as: ' + bot.user.fullName)
})

bot.events.on('MESSAGE_CREATE', (msg) => {
	if (msg.content.startsWith("/ping")==true) {
		msg.channel.sendMessage('pong');
	}
})