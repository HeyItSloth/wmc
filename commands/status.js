const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const servers = {
	'mod':		{ ip: '51.38.59.9:25576', color: [0, 204, 0] },
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Get the status of a server')
		.addSubcommand(subcommand => subcommand
			.setName('minecraft')
			.setDescription('Minecraft servers')
			.addStringOption(option => option.setName('server')
				.setDescription('Which server to check')
				.addChoices(
					{ name: 'Modded', value: 'mod' },
				)
				.setRequired(true))),
	async execute(interaction) {
		const game = interaction.options.getSubcommand();
		let server = '';
		let serverip = '';
		let serverData;

		const embed = new EmbedBuilder();

		if (game == 'minecraft') {
			server = interaction.options.get('server').value;
			serverData = servers[server];
			serverip = serverData.ip;

			const statusResult = await request(`https://api.mcsrvstat.us/2/${serverip}`);
			const { players, motd, mods, online, version } = await getJSONResponse(statusResult.body);

			embed.setColor(serverData.color)
				.setAuthor({ name: online ? 'Online' : 'Offline' })
				.setTitle('Minecraft')
				.setURL(`https://mcsrvstat.us/server/${serverip}`)
				.setDescription(`*${motd.clean[0]}*`)
				.addFields(
					{ name: 'Online', value: `${players.online} / ${players.max}`, inline: true },
					{ name: 'Players', value: players.list.join(', '), inline: true },
					{ name: 'Mods', value: mods.names.length.toString(), inline: true },
					{ name: 'Version', value: version, inline: true },
				);
		}
		interaction.reply({ embeds: [embed] });
	},
};

async function getJSONResponse(body) {
	let fullBody = '';

	for await (const data of body) {
		fullBody += data.toString();
	}

	return JSON.parse(fullBody);
}