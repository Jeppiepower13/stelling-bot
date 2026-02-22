const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');

function loadConfig() {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autostelling')
        .setDescription('Zet automatische wekelijkse stelling aan of uit')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName('aan')
                .setDescription('true = aan, false = uit')
                .setRequired(true)
        ),

    async execute(interaction) {

        const enabled = interaction.options.getBoolean('aan');
        const guildId = interaction.guild.id;

        const config = loadConfig();
        if (!config[guildId]) config[guildId] = {};

        if (!config[guildId].autoStelling) {
            config[guildId].autoStelling = {
                enabled: false,
                day: 0,
                hour: 20,
                minute: 0
            };
        }

        config[guildId].autoStelling.enabled = enabled;
        saveConfig(config);

        interaction.reply({
            content: `✅ Automatische stelling is nu ${enabled ? 'AAN' : 'UIT'}.`,
            flags: 64
        });
    }
};