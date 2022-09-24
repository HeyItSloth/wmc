const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saved')
		.setDescription('Interact with the saved playlist')
		.addSubcommand(sub => sub.setName('list').setDescription('List the saved playlist'))
		.addSubcommand(sub => sub.setName('play').setDescription('Play the saved playlist'))
		.addSubcommand(sub => sub.setName('remove').setDescription('Remove a song from the playlist').addNumberOption(option => option.setName('track').setDescription('Which track to remove').setRequired(true))),
	async execute(me, interaction, player, Store, Tracks) {
		const checkRestrict = await Store.findOne({ where: { name:'music' } });
		if (checkRestrict) {
			const restrictChannel = await interaction.guild.channels.fetch(checkRestrict.value);
			if (restrictChannel != interaction.channel.id) {
				return interaction.reply({ content: `❌ | The music commands are restricted to the ${restrictChannel} channel!`, ephemeral: true });
			}
		}

		const command = interaction.options.getSubcommand();

		if (command === 'list') {
			const saved = await Tracks.findAll();
			if (saved.length == 0) return void interaction.reply('❌ | The Saved playlist is empty!');
			const tracks = saved.slice(0, 10).map((m, i) => {
				const t = JSON.parse(m.track);
				return `${i + 1}. **${t.title}** ([link](${t.url}))`;
			});

			const list = new EmbedBuilder()
				.setTitle('Saved Playlist')
				.setDescription(`${tracks.join('\n')}${
					''
				}`)
				.setColor(0xff0000);

			await interaction.reply({ embeds: [list] });
		} else if (command === 'play') {
			if (!interaction.member.voice.channelId) return await interaction.reply({ content: '❌ | You are not in a voice channel!', ephemeral: true });
			if (me.voice.channelId && interaction.member.voice.channelId !== me.voice.channelId) return await interaction.reply({ content: '❌ | You are not in my voice channel!', ephemeral: true });

			let queue = player.getQueue(interaction.guildId);
			if (!queue) {
				queue = player.createQueue(interaction.guild, {
					metadata: interaction.channel,
					leaveOnEnd: false,
				});
			}
			const saved = await Tracks.findAll();
			for (const v of saved) {
				const t = JSON.parse(v.track);
				const res = await player.search(t.url, {
					requestedBy: interaction.user,
					searchEngine: QueryType.AUTO,
				}).then(x => x.tracks[0]);
				queue.addTrack(res);
			}

			try {
				if (!queue.connection) await queue.connect(interaction.member.voice.channel);
			} catch {
				await player.deleteQueue(interaction.guild.id);
				return await interaction.reply({ content: '❌ | Could not join your voice channel!', ephemeral: true });
			}
			interaction.reply('⏱ | Loading the Saved Playlist now!');
			if (!queue.playing) await queue.play();
		} else {
			const rem = interaction.options.get('track').value;
			const t = await Tracks.findAll();
			const song = t[rem - 1].id;
			await Tracks.destroy({ where: { id: song } });

			return await interaction.reply('✅ | Successfully removed song from the playlist.');
		}
	},
};