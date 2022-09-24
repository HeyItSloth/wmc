const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song')
		.addStringOption(option => option.setName('song').setDescription('The song to play').setRequired(true)),
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

		const query = interaction.options.get('song').value;
		const res = await player.search(query, {
			requestedBy: interaction.user,
			searchEngine: QueryType.AUTO,
		}).then(x => x.tracks[0]);

		if (!res) return await interaction.reply({ content: `❌ | Track **${query}** was not found!` });

		const queue = player.createQueue(interaction.guild, {
			metadata: interaction.channel,
			leaveOnEnd: false,
		});

		try {
			if (!queue.connection) await queue.connect(interaction.member.voice.channel);
		} catch {
			await player.deleteQueue(interaction.guild.id);
			return await interaction.reply({ content: '❌ | Could not join your voice channel!', ephemeral: true });
		}

		if (!res.playlist) {
			await interaction.reply({ content: `⏱ | Loading track **${res.title}**!` });
		} else {
			await interaction.reply({ content: `⏱ | Loading playlist, adding **${res.playlist.tracks.length}** songs to the queue!` });
		}

		res.playlist ? queue.addTracks(res.playlist.tracks) : queue.addTrack(res);

		if (!queue.playing) await queue.play();
	},
};