const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const chalk = require('chalk');

const commands = [];

if (!fs.existsSync('./commands')) {
	fs.mkdirSync('./commands');
}
const commandDirs = fs.readdirSync('./commands');
let dir;
for (dir of commandDirs) {
	const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${dir}/${file}`);
		commands.push(command.data.toJSON());
	}
}


const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log(chalk.greenBright('>> Successfully registered application commands.')))
	.catch(console.error);
