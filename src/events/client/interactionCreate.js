module.exports = {
    name: 'interactionCreate',

    async execute(interaction, client) {

        // ================= SLASH COMMANDS =================
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error("Command error:", error);
            }

            return;
        }

        // ================= BUTTONS =================
        if (interaction.isButton()) {

            const stellingCommand = client.commands.get('stelling');
            if (!stellingCommand) return;

            const activePoll = stellingCommand.getActivePoll(interaction.guild.id);
            if (!activePoll) return;

            const [type] = interaction.customId.split('_');
            const userId = interaction.user.id;

            activePoll.eens.delete(userId);
            activePoll.oneens.delete(userId);

            if (type === 'eens') activePoll.eens.add(userId);
            if (type === 'oneens') activePoll.oneens.add(userId);

            try {
                await interaction.reply({
                    content: '✅ Je stem is geregistreerd!',
                    ephemeral: true
                });

                setTimeout(async () => {
                    try { await interaction.deleteReply(); } catch {}
                }, 3000);

            } catch (error) {
                console.error("Button error:", error);
            }
        }
    }
};