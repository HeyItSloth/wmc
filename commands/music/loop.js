const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Toggle the loop')
		.addIntegerOption(option => option.setName('mode')
			.setDescription('Sets loop mode')
			.setRequired(true)
			.addChoices(
				{ name: 'Off', value: QueueRepeatMode.OFF },
				{ name: 'Track', value: QueueRepeatMode.TRACK },
				{ name: 'Queue', value: QueueRepeatMode.QUEUE },
				{ name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
			)),
	async execute(me, interaction, player, Store) {
		const checkRestrict = await Store.findOne({ where: { name:'music' } });
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.value);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({ content: `❌ | The music commands are restricted to the ${restrictChannel} channel!`, ephemeral: true });
			}
		}
		if (!interaction.member.voice.channelId) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true });
		if (me.voice.channelId && interaction.member.voice.channelId !== me.voice.channelId) return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true });
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is being played!');
		const loopMode = interaction.options.get('mode').value;
		const success = queue.setRepeatMode(loopMode);
		const mode = (loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶');
		return void interaction.reply({ content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!' });
	},
};