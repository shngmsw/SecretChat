// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const privateChat = require('./main.js')

client.login('NzE3NzM0MjY1MTQzNjg5MzE2.XteoHw.HLmPol8jwQiC9hFZLRZ-iIfYSXU');

client.on('voiceStateUpdate', (oldMember, newMember) => {
  privateChat.onVoiceStateUpdate(oldMember, newMember);
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});