const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports.registerEvents = (client, player, Store) => {

	// PLAYER

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

	player.on('trackAdd', (queue, track) => {
		const trackAdded = new EmbedBuilder()
			.setColor(0x0000ff)
			.setTitle('Track Added')
			.setDescription(`[${track.title}](${track.url}) has been added to the queue!`)
			.addFields(
				{ name: 'Added By:', value: track.requestedBy.tag, inline: true },
				{ name: 'Artist', value: track.author, inline: true },
			)
			.setTimestamp();
		queue.metadata.send({ embeds: [trackAdded] });
	});

	player.on('botDisconnect', (queue) => {
		const dc = new EmbedBuilder()
			.setColor(0x0000ff)
			.setTimestamp()
			.setTitle('Disconnected!')
			.setDescription('I have been manually disconnected! Clearing the queue now... <:smiling_face_with_tear:1035300765134237817>');
		queue.metadata.send({ embeds: [dc] });
	});

	player.on('channelEmpty', (queue) => {
		const empty = new EmbedBuilder()
			.setColor(0x0000ff)
			.setTimestamp()
			.setTitle('Channel Empty')
			.setDescription('I\'ve been left on my own, so I suppose I\'ll just leave then... <:pensive:1035301731342487642>');
		queue.metadata.send({ embeds: [empty] });
	});

	// CLIENT

	client.on('guildMemberAdd', async member => {
		const chan = member.guild.systemChannel;
		chan.send(`A new person! ${member} has joined the Server!`);

		// Auto-role

		const role = await Store.findOne({ where: { name: 'default' } });
		if (role == null) {
			return;
		}
		member.roles.add(await member.guild.roles.fetch(role.value));

		// Logging

		const logJoin = new EmbedBuilder()
			.setAuthor({ name: 'Admin Log' })
			.setTimestamp();
		const logger = await Store.findOne({ where: { name: 'log' } });
		if (logger == null) {
			return;
		}
		logJoin.setTitle('Member Joined');
		logJoin.setDescription(`${member} has joined.`);
		logJoin.setThumbnail(member.user.avatarURL());
		logJoin.addFields(
			{ name: 'Joined Discord On:', value: member.user.createdAt.toUTCString(), inline: true },
		);
		logJoin.setColor(0x00CC00);
		const log = await member.guild.channels.fetch(logger.value);
		await log.send({ embeds: [logJoin] });
	});

	client.on('guildMemberRemove', async member => {
		const logLeave = new EmbedBuilder()
			.setAuthor({ name: 'Admin Log' })
			.setTimestamp();
		const logger = await Store.findOne({ where: { name: 'log' } });
		if (logger == null) {
			return;
		}
		logLeave.setDescription(`${member} has left the server`);
		logLeave.setTitle('Member Left');
		logLeave.setThumbnail(member.user.avatarURL());
		logLeave.addFields(
			{ name: 'Joined Server On:', value: member.joinedAt.toUTCString(), inline: true },
			{ name: 'Joined Discord On:', value: member.user.createdAt.toUTCString(), inline: true },
		);
		logLeave.setColor(0xCC0000);
		const log = await member.guild.channels.fetch(logger.value);
		await log.send({ embeds: [logLeave] });
	});

};