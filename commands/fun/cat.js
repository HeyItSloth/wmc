const { SlashCommandBuilder } = require('discord.js');
const { request } = require('undici');
const { getJSONResponse } = require('../../bot.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('gib cat'),
	async excute(_, interaction) {
		const catResult = await request('https://aws.random.cat/meow');
		const { file } = await getJSONResponse(catResult.body);

		interaction.reply({ files: [file] });
	},
};