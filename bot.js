// Bulk requires

const fs = require('fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const chalk = require('chalk');
const Sequelize = require('sequelize');

// Init Client

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

// Init DB

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Store = sequelize.define('store', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	value: {
		type: Sequelize.STRING,
	},
});

// Init commands

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}

// Client Ready check

client.once('ready', () => {
	const d = new Date();
	const time = Date.now();
	console.log(chalk.blue(`Ready at ${d.toLocaleString(time)}`));

	client.user.setActivity(':smiley: Test', { type: ActivityType.Custom });

	try {
		sequelize.authenticate();
		console.log(chalk.greenBright('>> DATABASE INITIALIZED, CONNECTED'));
	} catch (error) {
		console.error(chalk.redBright('>> UNABLE TO CONNECT: ', error));
	}

	Store.sync({ force: false });
});

// Events

client.on('guildMemberAdd', async member => {
	const chan = member.guild.systemChannel;
	chan.send(`${member} has joined the clan.`);
	const role = await Store.findOne({ where:{ name: 'default' } });
	if (role == null) {
		return;
	}
	member.roles.add(await member.guild.roles.fetch(role.value));
});

// Command handler

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, Store);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login

client.login(token);