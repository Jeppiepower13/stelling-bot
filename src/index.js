require('dotenv').config();

const { Client, IntentsBitField, Collection } = require('discord.js');
const fs = require("fs");
const path = require("path");
const express = require('express');

// ================= EXPRESS SERVER =================

const app = express();

app.get("/", (req, res) => {
    res.send("✅ Stelling Bot is online!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Webserver draait op poort ${PORT}`);
});

// ================= DISCORD CLIENT =================

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.commands = new Collection();
client.commandArray = [];

// ================= LOAD HANDLERS =================

const functionsPath = path.join(__dirname, "functions");
const functionFolders = fs.readdirSync(functionsPath);

for (const folder of functionFolders) {

    const functionFiles = fs
        .readdirSync(path.join(functionsPath, folder))
        .filter(file => file.endsWith(".js"));

    for (const file of functionFiles) {
        require(path.join(functionsPath, folder, file))(client);
    }
}

// ================= TEST MESSAGE =================

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "hallo") {
        message.reply("Hallo terug!");
    }
});

// ================= START BOT =================

client.handleEvents();
client.login(process.env.TOKEN);