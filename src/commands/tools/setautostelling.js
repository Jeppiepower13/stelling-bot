const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');

/* ================= CONFIG ================= */

function loadConfig() {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

/* ================= DAG MAPPING ================= */

const dagenMap = {
    zondag: 0,
    maandag: 1,
    dinsdag: 2,
    woensdag: 3,
    donderdag: 4,
    vrijdag: 5,
    zaterdag: 6
};

const dagenNamen = [
    'Zondag',
    'Maandag',
    'Dinsdag',
    'Woensdag',
    'Donderdag',
    'Vrijdag',
    'Zaterdag'
];

/* ================= COMMAND ================= */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautostelling')
        .setDescription('Stel dag en tijd in voor automatische stelling')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('dag')
                .setDescription('Bijv: zondag, maandag...')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('tijd')
                .setDescription('Tijd in formaat HH:MM (bijv 20:00)')
                .setRequired(true)
        ),

    async execute(interaction) {

        const dagInput = interaction.options.getString('dag').toLowerCase();
        const tijdInput = interaction.options.getString('tijd');

        const guildId = interaction.guild.id;

        if (!dagenMap.hasOwnProperty(dagInput)) {
            return interaction.reply({
                content: '❌ Ongeldige dag. Gebruik bijv: zondag, maandag, dinsdag...',
                flags: 64
            });
        }

        const tijdMatch = tijdInput.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);

        if (!tijdMatch) {
            return interaction.reply({
                content: '❌ Ongeldig tijdformaat. Gebruik HH:MM (bijv 20:00).',
                flags: 64
            });
        }

        const hour = parseInt(tijdMatch[1]);
        const minute = parseInt(tijdMatch[2]);
        const day = dagenMap[dagInput];

        const config = loadConfig();
        if (!config[guildId]) config[guildId] = {};

        config[guildId].autoStelling = {
            enabled: true,
            day,
            hour,
            minute
        };

        saveConfig(config);

        interaction.reply({
            content:
                `✅ Automatische stelling ingesteld op **${dagenNamen[day]} om ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}**.\n\n` +
                `Gebruik \`/autostelling false\` om uit te zetten.`,
            flags: 64
        });
    }
};