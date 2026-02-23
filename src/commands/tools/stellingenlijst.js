const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const stellingenDir = path.join(process.cwd(), 'src/data/stellingen');

function ensureGuildFile(guildId) {

    if (!fs.existsSync(stellingenDir)) {
        fs.mkdirSync(stellingenDir, { recursive: true });
    }

    const guildFile = path.join(stellingenDir, `${guildId}.json`);

    if (!fs.existsSync(guildFile)) {
        fs.writeFileSync(guildFile, JSON.stringify([]));
    }

    return guildFile;
}

function loadStellingen(guildId) {
    const file = ensureGuildFile(guildId);
    return JSON.parse(fs.readFileSync(file));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stellingenlijst')
        .setDescription('Bekijk hoeveel stellingen er nog in de lijst staan'),

    async execute(interaction) {

        const guildId = interaction.guild.id;

        try {

            const stellingen = loadStellingen(guildId);
            const aantal = stellingen.length;

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `📋 Er staan nog **${aantal}** stelling(en) in de lijst.`,
                    flags: 64
                });
            }

        } catch (error) {

            console.error("Stellingenlijst error:", error);

            // 🔥 Belangrijk: geen dubbele reply meer
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: '❌ Kon de lijst niet ophalen.',
                        flags: 64
                    });
                } catch {}
            }
        }
    }
};