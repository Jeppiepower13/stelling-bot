const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
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
        .setName('setstellingkanaal')
        .setDescription('Stel het kanaal in waar stellingen worden gepost')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('kanaal')
                .setDescription('Selecteer een tekstkanaal')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel('kanaal');
        const guildId = interaction.guild.id;

        const config = loadConfig();
        if (!config[guildId]) config[guildId] = {};

        config[guildId].stellingChannel = channel.id;
        saveConfig(config);

        await interaction.reply({
            content: `✅ Stellingen worden nu gepost in ${channel}`,
            flags: 64
        });
    }
};