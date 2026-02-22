const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');

/* ================= CONFIG FUNCTIES ================= */

function loadConfig() {
    const dir = path.dirname(configPath);

    // Maak map aan indien nodig
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Maak bestand aan indien nodig
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

/* ================= COMMAND ================= */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setpolltijd')
        .setDescription('Stel de standaard pollduur in (in seconden)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName('seconden')
                .setDescription('Aantal seconden dat een poll standaard duurt')
                .setRequired(true)
        ),

    async execute(interaction) {

        const seconds = interaction.options.getInteger('seconden');
        const guildId = interaction.guild.id;

        // Validatie
        if (seconds < 10) {
            return interaction.reply({
                content: '❌ Minimum is 10 seconden.',
                flags: 64
            });
        }

        if (seconds > 604800) { // 7 dagen max
            return interaction.reply({
                content: '❌ Maximum is 7 dagen (604800 seconden).',
                flags: 64
            });
        }

        const config = loadConfig();

        if (!config[guildId]) {
            config[guildId] = {};
        }

        config[guildId].defaultPollDuration = seconds;

        saveConfig(config);

        await interaction.reply({
            content: `✅ Standaard pollduur ingesteld op ${seconds} seconden.`,
            flags: 64
        });
    }
};