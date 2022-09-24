const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove a song from the queue')
		.addIntegerOption(option => option.setName('track').setDescription('The position of the song in the queue').setRequired(true)),
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
		if (!queue || !queue.playing) return void interaction.reply('❌ | No music is currently playing...');
		const queueId = interaction.options.get('track').value;
		const song = queue.tracks[queueId - 1];
		const success = queue.remove(song);

		return void interaction.reply({
			content: success ? `✅ | Removed track **${song.title}** from the queue!` : '❌ | Something went wrong...',
		});
	},
};