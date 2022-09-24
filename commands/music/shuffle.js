const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffle the queue')
		.addIntegerOption(option => option.setName('toggle')
			.setDescription('Toggle shuffle of the queue.')
			.setRequired(true)
			.addChoices(
				{ name: 'Off', value: 1 },
				{ name: 'On', value: 2 },
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
		const shuffle = interaction.options.get('toggle').value;
		if (shuffle == 1) {
			queue.shuffle(false);
			return void interaction.reply('✅ | Queue shuffled!');
		} else {
			queue.shuffle(true);
			return void interaction.reply('✅ | Queue unshuffled!');
		}
	},
};