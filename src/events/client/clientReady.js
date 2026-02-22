module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {

        console.log(`🚀 ${client.user.tag} is online.`);

        // 🔥 STATUS INSTELLEN
        client.user.setPresence({
            activities: [
                {
                    name: 'de Stellingen van OVB',
                    type: 0 // 0 = Playing
                }
            ],
            status: 'online'
        });

        // Commands registreren
        await client.handleCommands();

        // Scheduler starten
        const scheduler = require('../../utils/autoStellingScheduler');
        scheduler(client);
    }
};