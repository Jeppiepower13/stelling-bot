const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stopstelling')
        .setDescription('Stop de actieve stelling')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const guildId = interaction.guild.id;

        const stellingCommand = interaction.client.commands.get('stelling');
        if (!stellingCommand) {
            return interaction.reply({
                content: '❌ Stelling systeem niet gevonden.',
                ephemeral: true
            });
        }

        const activePoll = stellingCommand.getActivePoll(guildId);

        if (!activePoll) {
            return interaction.reply({
                content: '❌ Er is geen actieve stelling.',
                ephemeral: true
            });
        }

        // Stop de poll via de functie in stelling.js
        await stellingCommand.stopPoll(guildId);

        return interaction.reply({
            content: '⛔ Stelling is handmatig gestopt!',
            ephemeral: true
        });
    }
};