const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Toont alle beschikbare commando’s'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('📖 Stelling Bot - Help')
            .setColor(0x2b2d31)
            .setDescription('Hier zijn alle beschikbare commando’s:')
            .addFields(
                {
                    name: '📢 Stellingen',
                    value:
                        '`/stelling` - Start een nieuwe stelling\n' +
                        '`/stopstelling` - Stop de actieve stelling\n' +
                        '`/addstelling` - Voeg een nieuwe stelling toe',
                    inline: false
                },
                {
                    name: '⚙️ Instellingen',
                    value:
                        '`/setstellingkanaal` - Stel kanaal in voor stellingen\n' +
                        '`/setpolltijd` - Stel standaard pollduur in\n' +
                        '`/setautostelling` - Stel automatische stelling in',
                    inline: false
                },
                {
                    name: '🔧 Overig',
                    value:
                        '`/help` - Toon dit help menu\n' +
                        '`/invite` - Nodig de bot uit',
                    inline: false
                }
            )
            .setFooter({ text: 'Stelling Bot' })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: 64 // ephemeral
        });
    }
};