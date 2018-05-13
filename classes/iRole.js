const classHelper = require('./classHelper.js');
const iBase = require("./iBase.js");
const iPermissions = require("./iPermissions.js");

class iRole extends iBase {
	constructor(discord, data, guild_id) {
		super(discord, data);
		
		this.permissions = new iPermissions(discord, data.permissions, 'iRole');
		delete data.permissions
		
		for (var index in data) {
			var value = data[index]
			this[index] = value;
		}
		
		this.guild_id = guild_id;
	}
	
	get guild() {
		return (this.discord.guilds[this.guild_id]);
	}
	
	get color_hex() {
		return this.color.toString(16);
	}
	
	setPosition(position) {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.modifyGuildRoles, {"guild.id": this.guild_id})
			
			if (typeof(position) != 'number') return reject('setPosition arg#1 expected a number');
				
			var patch = [
				{
					"name": this.name,
					"id": this.id,
					"position": position
				}
			]
			
			for (var i in this.guild.roles) {
				var role = this.guild.roles[i];
				
				if (role.name != '@everyone') {
					if (role.position == position) {
						patch.push({"name": role.name, "id": role.id, "position": this.position});
					} else if (role.position < position) {
						patch.push({"name": role.name, "id": role.id, "position": role.position-1});
					}
				}
			}
			
			discord.http.patch(
				url,
				JSON.stringify(patch),
				function(error, response, rawData) {
					if (error) return reject(error);
					if (response.statusCode==200) return resolve(rawData);
					reject(rawData);
				}
			)
		})
	}
	
	commit() {
		var discord = this.discord;
		return new Promise((resolve, reject) => {
			var url = classHelper.formatURL(discord.endpoints.modifyGuildRole, {"guild.id": this.guild_id, "role.id": this.id})
			discord.http.patch(
				url,
				JSON.stringify({name: this.name, permissions: this.permissions.permission, color: this.color, hoist: this.hoist, mentionable: this.mentionable}),
				function(err, res, raw) {
					if (err) reject(err);
					console.log(res.statusCode, raw);
					if (res.statusCode==200) return resolve(raw);
					reject(raw);
				}
			)
		})
	}
	
	
}

module.exports = iRole;




