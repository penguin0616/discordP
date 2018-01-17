const discordp = require("PATH_TO_MAIN_FOLDER/index.js");

var bot = new discordp({
	debug: true, // if ur into debugging mode and wanna help me by sending me bugs
	shardId: 1,
	shardCount: 1
});

bot.connect({token: ""})
// discord hates self bots

bot.events.on('GATEWAY_READY', () => {
	console.log('Logged in as: ' + bot.user.fullName)
})

bot.events.on('MESSAGE_CREATE', (msg) => {
	if (msg.content.startsWith("/ping")==true) {
		msg.channel.sendMessage('pong');
	}
})