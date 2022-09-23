const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rules')
		.setDescription('Post the rules')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor(0x7F00FF)
			.setTitle('Server Rules')
			.addFields(
				{ name: 'Rule 1 - Don\'t Be Hatin\'', value: 'This one should go without saying, but it\'s the most obvious of them all. No racism, sexism, homophobia, transphobia, or any other discrimination of any kind. This is 0 tolerance, and will be acted on swiftly.', inline: false },
				{ name: 'Rule 2 - Keep It Legal', value: 'While this server is 18+, please bear in mind the rules of Discord. That means no illegal content, and if you have to ask "is it legal?", the answer is probably no.', inline: false },
				{ name: 'Rule 3 - Respect The Hierarchy', value: 'People are in their roles for a reason. This isn\'t a democracy, if someone above you asks you to do something, do it. On the flip side, however...', inline: false },
				{ name: 'Rule 4 - Rank Is Earned, Not Given', value: 'If you are trusted with responsibility, it\'s trust. Do not misuse that trust, or that power, or it will be taken away.', inline: false },
				{ name: 'Rule 5 - Know Your Channels', value: 'The channels are all labelled and have descriptions. Use them properly. Memes in the memes, anything NFSW in the channels marked as such, etc. You get the point.', inline: false },
				{ name: 'Rule 6 - Nobody Likes Spam', value: 'We don\'t mean the processed meat. We mean the other kind. Don\'t spam things. If you have a question, ask it and wait. Found something funny, post it once. Just be sensible about it.', inline: false },
				{ name: 'Rule 7 - Adverts? No Thanks', value: 'Adverts or links to other servers *not* preapproved by a Captain or above will be removed. Simple. If you want more members in your little meme server, post it online. Not here.', inline: false },
				{ name: 'Rule 8 - God', value: '[This person](https://media.discordapp.net/attachments/1019317185023316021/1019355470294691880/GoodSpirit.png) is god. Do not question. Only worship.', inline: false },
				{ name: 'Important Note', value: '*These servers are subject to change at any point, and it is your responsibility to keep up-to-date on them. We also reserve the right to kick/ban any member for any reason we deem necessary. Don\'t like it? Leave.*', inline: false },
			)
			.setTimestamp()
			.setDescription('Listed below are the rules of the server. Follow them, and you\'ll stay alive. Got it? Good.');

		interaction.channel.send({ embeds: [embed] });
		await interaction.reply({ content: 'Sent!', ephemeral: true });
	},
};