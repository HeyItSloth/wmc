const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the queue'),
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
		if (!queue || !queue.playing) return void interaction.reply({ content: '❌ | No music is currently playing!', ephemeral: true });
		const paused = queue.setPaused(false);
		return void interaction.reply({
			content: paused ? '▶ | Paused current track!' : '❌ | Something went wrong...',
		});
	},
};