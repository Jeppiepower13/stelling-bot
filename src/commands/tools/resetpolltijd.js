const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');

function loadConfig() {
    const dir = path.dirname(configPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetpolltijd')
        .setDescription('Reset de standaard pollduur naar 24 uur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const config = loadConfig();

        if (!config[guildId] || !config[guildId].defaultPollDuration) {
            return interaction.reply({
                content: '❌ Er is geen aangepaste pollduur ingesteld.',
                flags: 64
            });
        }

        delete config[guildId].defaultPollDuration;

        saveConfig(config);

        await interaction.reply({
            content: '✅ Pollduur gereset naar 24 uur (86400 seconden).',
            flags: 64
        });
    }
};