const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

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

function saveStellingen(guildId, data) {
    const file = ensureGuildFile(guildId);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addstelling')
        .setDescription('Voeg een nieuwe stelling toe')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('stelling')
                .setDescription('De stelling tekst')
                .setRequired(true)
        ),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const tekst = interaction.options.getString('stelling');

        const stellingen = loadStellingen(guildId);

        stellingen.push(tekst);
        saveStellingen(guildId, stellingen);

        // 🔥 GEEN deferReply hier
        return interaction.reply({
            content: `✅ Stelling toegevoegd! (${stellingen.length} totaal in deze server)`,
            flags: 64
        });
    }
};