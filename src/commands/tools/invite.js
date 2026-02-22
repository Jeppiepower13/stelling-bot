const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite deze bot doormiddel van deze command.'),

    async execute(interaction, client) {
        try {
            await interaction.reply(`Hallo, leuk dat u me wilt gebruiken in uw discord server. Dit is mijn [invite link](https://discord.com/oauth2/authorize?client_id=1035983090356605059&permissions=8&integration_type=0&scope=applications.commands+bot)`)
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: `Er is een fout opgetreden, probeer het later nog eens!`, ephemeral: true });
        }
    }
};