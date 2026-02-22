const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'src/data/guildConfig.json');

function loadConfig() {
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath));
}

const lastRun = new Map();
const lastEmptyNotice = new Map();

module.exports = (client) => {

    console.log('🕒 AutoStelling scheduler gestart.');

    setInterval(async () => {

        const now = new Date();
        const config = loadConfig();

        for (const guildId in config) {

            const guildConfig = config[guildId];
            const auto = guildConfig.autoStelling;

            if (!auto || !auto.enabled) continue;

            if (
                now.getDay() === auto.day &&
                now.getHours() === auto.hour &&
                now.getMinutes() === auto.minute
            ) {

                const uniqueKey = `${guildId}-${now.getDay()}-${now.getHours()}-${now.getMinutes()}`;

                if (lastRun.get(guildId) === uniqueKey) continue;
                lastRun.set(guildId, uniqueKey);

                const stellingCommand = client.commands.get('stelling');
                if (!stellingCommand) continue;

                try {

                    console.log("🚀 Probeer AutoStelling te starten...");

                    const started = await stellingCommand.startPoll(
                        client,
                        guildId,
                        null // gebruikt defaultPollDuration
                    );

                    console.log("📊 Start result:", started);

                    if (started) {

                        console.log(`📢 AutoStelling succesvol gestart in guild ${guildId}`);

                    } else {

                        const channelId = guildConfig.stellingChannel;
                        const channel = client.channels.cache.get(channelId);

                        if (!channel) continue;

                        // voorkom spam binnen dezelfde minuut
                        if (lastEmptyNotice.get(guildId) === uniqueKey) continue;
                        lastEmptyNotice.set(guildId, uniqueKey);

                        await channel.send({
                            content:
                                `@everyone\n\n` +
                                `📭 **De stellingen zijn op!**\n\n` +
                                `Blijf nieuwe stellingen insturen met \`/addstelling\` 💡\n` +
                                `Dan is er volgende keer weer een nieuwe stelling!`,
                            allowedMentions: { parse: ['everyone'] }
                        });

                        console.log("📭 Lege stellingen melding gestuurd.");
                    }

                } catch (err) {
                    console.error("❌ Fout bij AutoStelling:", err);
                }
            }
        }

    }, 1000);
};