const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

module.exports = (client) => {

    client.handleCommands = async () => {

        console.log("🌍 Global commands worden geregistreerd...");

        const commandsPath = path.join(__dirname, "../../commands");
        const commandFolders = fs.readdirSync(commandsPath);

        client.commands.clear();
        client.commandArray = [];

        for (const folder of commandFolders) {

            const folderPath = path.join(commandsPath, folder);

            const commandFiles = fs.readdirSync(folderPath)
                .filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {

                const filePath = path.join(folderPath, file);
                delete require.cache[require.resolve(filePath)];

                const command = require(filePath);

                if (!command.data || !command.execute) continue;

                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());

                console.log(`✅ Command geladen: ${command.data.name}`);
            }
        }

        console.log("📦 Totaal commands:", client.commandArray.length);

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        try {

            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: client.commandArray }
            );

            console.log(`✅ Global commands succesvol geladen! (${data.length})`);

        } catch (error) {
            console.error("❌ Fout bij registreren van commands:");
            console.error(error);
        }
    };
};