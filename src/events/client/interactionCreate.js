module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {

        try {

            // ================= SLASH COMMANDS =================
            if (interaction.isChatInputCommand()) {

                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                // 🔥 BELANGRIJK: DIRECT ACKNOWLEDGE
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply();
                }

                await command.execute(interaction);
                return;
            }

            // ================= BUTTONS =================
            if (interaction.isButton()) {

                const stellingCommand = client.commands.get('stelling');
                if (!stellingCommand) return;

                const activePoll = stellingCommand.getActivePoll(interaction.guild.id);
                if (!activePoll) return;

                // 🔥 DIRECT ACKNOWLEDGE BUTTON
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ flags: 64 });
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

            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: '❌ Er is een fout opgetreden.',
                        flags: 64
                    });
                } catch {}
            }
        }
    }
};