const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

module.exports = (client) => {

    client.handleCommands = async () => {

        console.log("🔄 Guild commands worden opnieuw geregistreerd...");

        const commandsPath = path.join(__dirname, "../../commands");
        const commandFolders = fs.readdirSync(commandsPath);

        client.commands.clear();
        client.commandArray = [];

        // ================= LOAD COMMAND FILES =================

        for (const folder of commandFolders) {

            const folderPath = path.join(commandsPath, folder);

            const commandFiles = fs.readdirSync(folderPath)
                .filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {

                const filePath = path.join(folderPath, file);

                delete require.cache[require.resolve(filePath)];

                const command = require(filePath);

                if (!command.data || !command.execute) {
                    console.warn(`⚠️ Ongeldige command file: ${file}`);
                    continue;
                }

                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());

                console.log(`✅ Command geladen: ${command.data.name}`);
            }
        }

        // ================= REGISTER TO DISCORD =================

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        try {

            console.log("🧹 Oude guild commands worden verwijderd...");

            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.GUILD_ID
                ),
                { body: [] }
            );

            console.log("✔ Oude commands verwijderd");

            console.log("📡 Commands worden naar Discord gestuurd...");

            const data = await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.GUILD_ID
                ),
                { body: client.commandArray }
            );

            console.log(`✅ Guild commands succesvol geladen! (${data.length})`);

        } catch (error) {

            console.error("❌ Fout bij registreren van commands:");
            console.error(error);

        }
    };
};