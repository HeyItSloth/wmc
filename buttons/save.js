module.exports = {
	data: 'save',
	async execute(me, interaction, player, saved) {
		if (me.voice.channelId && interaction.member.voice.channelId !== me.voice.channelId) return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true });
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing) return void interaction.reply({ content: '❌ | No music currently playing!', ephemeral: true });

		const isSaved = await saved.findOne({ where: { id: queue.current.url } });
		if (isSaved) return void interaction.reply({ content: '❌ | This song has already been saved!' });
		await interaction.deferUpdate();

		await saved.create({
			id: queue.current.url,
			track: JSON.stringify(queue.current),
		});
		await interaction.channel.send({ content: '✅ | Song saved to playlist!' });
	},
};