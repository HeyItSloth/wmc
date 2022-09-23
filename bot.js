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
if (!fs.existsSync('./commands')) {
	fs.mkdirSync('./commands');
}
const commandDirs = fs.readdirSync('./commands');
let dir;
for (dir of commandDirs) {
	console.log(chalk.blueBright(`>> Beginning init of commands in '${dir}' category.`));
	const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		console.log(chalk.yellow(`>>> Initializing ${file}...`));
		const command = require(`./commands/${dir}/${file}`);
		client.commands.set(command.data.name, command);
	}
	console.log(chalk.green(`>> Completed init of '${dir}', total tasks: ${commandFiles.length}`));
}

// Init buttons

client.buttons = new Collection();
if (!fs.existsSync('./buttons')) {
	fs.mkdirSync('./buttons');
}
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const button = require(`./buttons/${file}`);
	client.buttons.set(button.data, button);
}

// Client Ready check

client.once('ready', () => {
	const d = new Date();
	const time = Date.now();
	console.log(chalk.blue(`Ready at ${d.toLocaleString(time)}`));

	client.user.setActivity('Praise the Wraith', { type: ActivityType.Playing });

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
		await command.execute(interaction, player, Store);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Button handler

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const button = interaction.client.buttons.get(interaction.customId);

	if (!button) return;

	try {
		if (interaction.customId == 'pauseplay') {
			paused = await button.execute(interaction, player, paused);
		} else {
			await button.execute(interaction, player);
		}
	} catch (e) {
		console.error(e);
	}
});

// Login

client.login(token);