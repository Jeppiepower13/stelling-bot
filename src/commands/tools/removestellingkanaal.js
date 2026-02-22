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
        .setName('removestellingkanaal')
        .setDescription('Verwijder het ingestelde stelling kanaal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const config = loadConfig();

        if (!config[guildId] || !config[guildId].stellingChannel) {
            return interaction.reply({
                content: '❌ Er is geen stelling kanaal ingesteld.',
                flags: 64
            });
        }

        delete config[guildId].stellingChannel;

        saveConfig(config);

        await interaction.reply({
            content: '✅ Het stelling kanaal is verwijderd.',
            flags: 64
        });
    }
};