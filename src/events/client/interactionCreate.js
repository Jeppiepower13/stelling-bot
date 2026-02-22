module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {

        try {

            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await interaction.deferReply();
                } catch (err) {
                    // 🔥 Ignore Unknown interaction (Render wake-up issue)
                    if (err.code === 10062) return;
                    throw err;
                }

                await command.execute(interaction);
                return;
            }

            if (interaction.isButton()) {

                const stellingCommand = client.commands.get('stelling');
                if (!stellingCommand) return;

                const activePoll = stellingCommand.getActivePoll(interaction.guild.id);
                if (!activePoll) return;

                try {
                    await interaction.deferReply({ flags: 64 });
                } catch (err) {
                    if (err.code === 10062) return;
                    throw err;
                }

                const [type] = interaction.customId.split('_');
                const userId = interaction.user.id;

                activePoll.eens.delete(userId);
                activePoll.oneens.delete(userId);

                if (type === 'eens') activePoll.eens.add(userId);
                if (type === 'oneens') activePoll.oneens.add(userId);

                await interaction.editReply({
                    content: '✅ Je stem is geregistreerd!'
                });

                setTimeout(async () => {
                    try { await interaction.deleteReply(); } catch {}
                }, 3000);
            }

        } catch (error) {
            console.error("Interaction error:", error);
        }
    }
};