/* eslint-disable no-unused-vars */
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, IntegrationApplication } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Admin command')
		.addSubcommandGroup(subcommand => subcommand
			.setName('set')
			.setDescription('Set the restrictions of channel')
			.addSubcommand(sc => sc
				.setName('channel')
				.setDescription('Set a channel')
				.addStringOption(option => option.setName('type')
					.setDescription('What you are restricting')
					.setRequired(true)
					.addChoices(
						{ name: 'Music', value: 'music' },
						{ name: 'Moderation', value: 'mod' },
					))
				.addChannelOption(option => option.setName('channel')
					.setDescription('Which channel you are restricting to')
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
					.setRequired(true)))
			.addSubcommand(sc => sc
				.setName('role')
				.setDescription('Set a role')
				.addStringOption(option => option.setName('type')
					.setDescription('What you are restricting')
					.setRequired(true)
					.addChoices(
						{ name: 'Default', value: 'default' },
						{ name: 'DJ', value: 'dj' },
					))
				.addRoleOption(role => role.setName('role')
					.setDescription('Role to assign')
					.setRequired(true))))
		.addSubcommandGroup(subcommand => subcommand
			.setName('check')
			.setDescription('Check the restrictions of a type')
			.addSubcommand(sc => sc
				.setName('channel')
				.setDescription('Check a channel')
				.addStringOption(option => option.setName('type')
					.setDescription('What you are checking')
					.setRequired(true)
					.addChoices(
						{ name: 'Music', value: 'music' },
						{ name: 'Moderation', value: 'mod' },
					)))
			.addSubcommand(sc => sc
				.setName('role')
				.setDescription('Check a role')
				.addStringOption(option => option.setName('type')
					.setDescription('What you are checking')
					.setRequired(true)
					.addChoices(
						{ name: 'Default', value: 'default' },
						{ name: 'DJ', value: 'dj' },
					))))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, Store) {
		const mode = interaction.options.getSubcommandGroup();
		if (mode === 'set') {
			const type = interaction.options.getSubcommand();
			const key = interaction.options.get('type').value;

			if (type === 'channel') {
				const v = interaction.options.get('channel').value;
				try {
					const store = await Store.create({
						name: key,
						value: v,
					});
					const guildChannel = await interaction.guild.channels.fetch(v);
					interaction.reply(`Updated restrictions of type "${key}", set to channel: ${guildChannel.name}`);
				} catch (e) {
					if (e.name === 'SequelizeUniqueConstraintError') {
						const guildChannel = await interaction.guild.channels.fetch(v);
						const update = await Store.update({ value: v }, { where: { name: key } });
						return interaction.reply(`Updated module "${key}" to channel \`${guildChannel.name}\``);
					}
					console.error(e);
					return interaction.reply('Something went wrong...');
				}
			} else if (type === 'role') {
				const v = interaction.options.get('role').value;
				try {
					const store = await Store.create({
						name: key,
						value: v,
					});
					const guildRole = await interaction.guild.roles.fetch(v);
					interaction.reply(`Updated role for type "${key}", set to role \`@${guildRole.name}\`.`);
				} catch (e) {
					if (e.name === 'SequelizeUniqueConstraintError') {
						const guildRole = await interaction.guild.roles.fetch(v);
						const update = await Store.update({ value: v }, { where: { name: key } });
						return interaction.reply(`Updated role "${key}" to role \`@${guildRole.name}\`.`);
					}
					console.error(e);
					return interaction.reply('Something went wrong...');
				}
			}

		} else if (mode === 'check') {
			const type = interaction.options.getSubcommand();
			const v = interaction.options.get('type').value;
			const find = await Store.findOne({ where:{ name: v } });
			if (find == null) {
				return interaction.reply(`Nothing set for module "${v}". Using default value.`);
			}

			if (type === 'channel') {
				const chan = await interaction.guild.channels.fetch(find.value);
				return interaction.reply(`The ${type} module is restricted to the \`${chan.name}\` channel.`);
			} else if (type === 'role') {
				const role = await interaction.guild.roles.fetch(find.value);
				return interaction.reply(`The ${type} module is set to the \`@${role.name}\` role.`);
			}
		}
	},
};