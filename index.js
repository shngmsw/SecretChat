// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const privateChat = require('./main.js')

client.login(process.env.DISCORD_BOT_TOKEN);

client.on('voiceStateUpdate', (oldMember, newMember) => {
  privateChat.onVoiceStateUpdate(oldMember, newMember);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});