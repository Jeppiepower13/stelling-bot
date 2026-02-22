console.log("NIEUWE HELP.JS WORDT GEBRUIKT");
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Bekijk alle beschikbare commando’s'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle('📘 Stelling Bot - Help')
            .setDescription('Hier zijn alle beschikbare commando’s:')
            .addFields(
                {
                    name: '📢 Stellingen',
                    value:
                        '`/stelling` - Start een nieuwe stelling\n' +
                        '`/stopstelling` - Stop de actieve stelling\n' +
                        '`/addstelling` - Voeg een nieuwe stelling toe'
                },
                {
                    name: '⚙️ Instellingen',
                    value:
                        '`/setstellingkanaal` - Kies het kanaal voor stellingen\n' +
                        '`/removestellingkanaal` - Verwijder het ingestelde kanaal\n' +
                        '`/setpolltijd` - Stel standaard poll duur in\n' +
                        '`/resetpolltijd` - Reset poll duur naar standaard'
                },
                {
                    name: '🤖 Automatisch',
                    value:
                        '`/setautostelling` - Stel automatische stellingen in\n' +
                        '`/autostelling` - Bekijk AutoStelling status'
                },
                {
                    name: 'ℹ️ Overig',
                    value:
                        '`/help` - Bekijk dit help menu\n' +
                        '`/invite` - Nodig de bot uit'
                }
            )
            .setFooter({ text: 'Stelling Bot • Speelt de Stellingen van OVB' });

        await interaction.editReply({
            embeds: [embed]
        });
    }
};