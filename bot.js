// Bulk requires

const fs = require('fs');
const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Player } = require('discord-player');
const { token } = require('./config.json');
const chalk = require('chalk');
const { Sequelize } = require('sequelize');
// const { getJSONResponse } = require('./util/funcs.js');

// Init Client

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

// Init Music player

const player = new Player(client);
let paused;

// Init DBs

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

const Tracks = sequelize.define('tracks', {
	id: {
		type: Sequelize.TEXT,
		unique: true,
		primaryKey: true,
	},
	track: {
		type: Sequelize.TEXT,
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
console.log(chalk.blueBright('>> Beginning init of buttons.'));

for (const file of buttonFiles) {
	console.log(chalk.yellow(`>>> Initializing ${file}...`));
	const button = require(`./buttons/${file}`);
	client.buttons.set(button.data, button);
}
console.log(chalk.green(`>> Completed init of buttons, total tasks: ${buttonFiles.length}`));

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
	Tracks.sync({ force: false });
});

// Events

player.on('trackStart', (queue, track) => {
	const nowplay = new EmbedBuilder()
		.setTitle(`Now Playing: ${track.title}`)
		.setURL(track.url)
		.setDescription(`▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 00:00/${track.duration}`)
		.setColor('#0000ff')
		.addFields(
			{ name: 'Requested By', value: track.requestedBy.tag, inline: true },
			{ name: 'Artist', value: track.author, inline: true },
		)
		.setTimestamp();
	const row1 = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('restart')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏮️'),
			new ButtonBuilder()
				.setCustomId('pauseplay')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏯️'),
			new ButtonBuilder()
				.setCustomId('skip')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏭️'),
		);
	const row2 = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('save')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('❤️'),
			new ButtonBuilder()
				.setCustomId('stop')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⏹️'),
		);
	queue.metadata.send({ embeds: [nowplay], components: [row1, row2] });
});

player.on('queueEnd', (queue) => {
	queue.metadata.send('Queue finished!');
});

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
	let back;

	try {
		back = await command.execute(client, interaction, player, Store, Tracks);
		if (back != undefined) {
			// console.log(back);
		}
	} catch (error) {
		console.error(error);
		// await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Button handler

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const button = interaction.client.buttons.get(interaction.customId);

	if (!button) return;

	try {
		if (interaction.customId == 'pauseplay') {
			paused = await button.execute(client, interaction, player, paused, Tracks);
		} else {
			await button.execute(client, interaction, player, Tracks);
		}
	} catch (e) {
		console.error(e);
	}
});

// Login

client.login(token);