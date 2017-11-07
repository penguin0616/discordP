const discord = require("PATH_TO_MAIN_FOLDER/main.js");
discord.connect({token: ""}) // can also use {email: "", password: ""}


discord.events.on('LOGIN_SUCCESS', (d) => {
	console.log("Successfully logged into discord.");
})

discord.events.on('LOGIN_FAIL', (d) => {
	console.log('Failed to login to discord.');
})

discord.events.on('MESSAGE_CREATE', (msg) => {
	if (msg.content.startsWith("/ping")==true) {
		msg.channel.sendMessage('pong');
	}
})