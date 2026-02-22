const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');
const stellingenDir = path.join(process.cwd(), 'src/data/stellingen');

const activePolls = new Map();
const pollTimeouts = new Map();

/* ================= FILE HELPERS ================= */

function ensureGuildFile(guildId) {
    if (!fs.existsSync(stellingenDir))
        fs.mkdirSync(stellingenDir, { recursive: true });

    const file = path.join(stellingenDir, `${guildId}.json`);
    if (!fs.existsSync(file))
        fs.writeFileSync(file, JSON.stringify([]));

    return file;
}

function loadStellingen(guildId) {
    return JSON.parse(fs.readFileSync(ensureGuildFile(guildId)));
}

function saveStellingen(guildId, data) {
    fs.writeFileSync(
        ensureGuildFile(guildId),
        JSON.stringify(data, null, 2)
    );
}

function loadConfig() {
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath));
}

/* ================= POLL CLOSE ================= */

async function closePoll(guildId, reasonText) {

    const poll = activePolls.get(guildId);
    if (!poll) return;

    const { message, stelling, eens, oneens } = poll;

    try {

        const freshMessage = await message.channel.messages.fetch(message.id);

        const disabledRow = new ActionRowBuilder().addComponents(
            freshMessage.components[0].components.map(btn =>
                ButtonBuilder.from(btn).setDisabled(true)
            )
        );

        await freshMessage.edit({
            content:
                `📢 **Stelling:**\n${stelling}\n\n` +
                `${reasonText}\n\n` +
                `👍 Eens: **${eens.size}**\n` +
                `👎 Oneens: **${oneens.size}**`,
            components: [disabledRow]
        });

    } catch {}

    if (pollTimeouts.has(guildId)) {
        clearTimeout(pollTimeouts.get(guildId));
        pollTimeouts.delete(guildId);
    }

    activePolls.delete(guildId);
}

/* ================= START POLL (HERGEBRUIKBAAR) ================= */

async function startPoll(client, guildId, customDuration = null) {

    if (activePolls.has(guildId)) return false;

    const config = loadConfig();
    const channelId = config[guildId]?.stellingChannel;
    if (!channelId) return false;

    const channel = client.channels.cache.get(channelId);
    if (!channel) return false;

    const stellingen = loadStellingen(guildId);
    if (stellingen.length === 0) return false;

    const randomIndex = Math.floor(Math.random() * stellingen.length);
    const gekozen = stellingen[randomIndex];

    stellingen.splice(randomIndex, 1);
    saveStellingen(guildId, stellingen);

    const duration =
        customDuration ||
        config[guildId]?.defaultPollDuration ||
        86400;

    const pollId = Date.now().toString();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`eens_${guildId}_${pollId}`)
            .setLabel('👍 Eens')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`oneens_${guildId}_${pollId}`)
            .setLabel('👎 Oneens')
            .setStyle(ButtonStyle.Danger)
    );

    const message = await channel.send({
        content:
            `@everyone\n\n📢 **Stelling:**\n${gekozen}\n\n` +
            `🗳️ Je hebt ${duration} seconden om te stemmen!`,
        components: [row],
        allowedMentions: { parse: ['everyone'] }
    });

    activePolls.set(guildId, {
        message,
        stelling: gekozen,
        eens: new Set(),
        oneens: new Set()
    });

    const timeout = setTimeout(() => {
        closePoll(guildId, '⏰ **Stemmen gesloten!**');
    }, duration * 1000);

    pollTimeouts.set(guildId, timeout);

    return true;
}

/* ================= COMMAND ================= */

module.exports = {

    data: new SlashCommandBuilder()
        .setName('stelling')
        .setDescription('Start een nieuwe stelling')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('tijd')
                .setDescription('Duur in seconden (optioneel)')
                .setRequired(false)
        ),

    async execute(interaction) {

        await interaction.deferReply({ flags: 64 });

        const guildId = interaction.guild.id;
        const customTime = interaction.options.getInteger('tijd');

        const success = await startPoll(
            interaction.client,
            guildId,
            customTime
        );

        if (!success)
            return interaction.editReply('❌ Kon geen stelling starten.');

        interaction.editReply('✅ Stelling gestart!');
    },

    getActivePoll: guildId => activePolls.get(guildId),
    stopPoll: guildId =>
        closePoll(guildId, '⛔ **Handmatig gestopt!**'),
    startPoll
};