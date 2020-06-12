// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");

module.exports = {
  onVoiceStateUpdate: onVoiceStateUpdate
};

const CHANNEL_PREFIX = "🔑_";
const BOT_ROLE_NAME = "BOT";

async function onVoiceStateUpdate(before, after) {
  if (before.voiceChannelID === after.voiceChannelID) {
    return;
  }

  if (before.voiceChannel != null) {
    if (before.voiceChannel.members.size == 0) {
      await txChDelete(before.voiceChannel);
    } else {
      await chExit(before.voiceChannel, before.user);
    }
  }

  if (after.voiceChannel != null) {
    let txtChannel;
    if (after.voiceChannel.members.size == 1) {
      txtChannel = await txChCreate(after);
    } else {
      txtChannel = await chJoin(after.voiceChannel, after.user);
    }
    await chSendNotification(txtChannel, after.user);
  }
}

function initOverWrites(guild, member) {
  console.log(member.id);
  let botRole = guild.roles.find("name", BOT_ROLE_NAME);
  let overwrites = [
    {
      id: guild.defaultRole.id,
      deny: ["VIEW_CHANNEL"]
    },
    {
      id: member.id,
      allow: ["VIEW_CHANNEL"]
    },
    {
      id: botRole.id,
      allow: ["VIEW_CHANNEL"]
    }
  ];
  return overwrites;
}

async function txChCreate(after) {
  try {
    let voiceChannel = after.voiceChannel;
    const guild = voiceChannel.guild;
    let chName = CHANNEL_PREFIX + voiceChannel.name + "_" + voiceChannel.id;
    console.log("createChannelName:" + chName);
    let overwrites = initOverWrites(guild, after.user);
    let result = guild.createChannel(chName, {
      parent: voiceChannel.parent,
      type: "text",
      permissionOverwrites: overwrites
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

function chFind(voiceChannel) {
  const guild = voiceChannel.guild;
  let searchCondition = voiceChannel.id;
  console.log("searchCondition:" + searchCondition);
  let result = guild.channels.find(val => val.name.endsWith(searchCondition));
  console.log("result:"+result.name)
  return result;
}

async function txChDelete(ch) {
  let target = await chFind(ch);
  if (target != null) {
    target.delete().catch(console.error);
  } else {
    console.log("削除するチャンネルがないンゴ");
  }
}

async function chJoin(ch, user) {
  let target = await chFind(ch);
  if (target != null) {
    target.overwritePermissions(user, { VIEW_CHANNEL: true });
    return target;
  } else {
    console.log("チャンネルがないンゴ");
  }
}

async function chExit(ch, user) {
  let target = await chFind(ch);
  if (target != null) {
    target.overwritePermissions(user, { VIEW_CHANNEL: false });
  } else {
    console.log("チャンネルがないンゴ");
  }
}

async function chSendNotification(ch, user) {
  const guild = ch.guild;
  guild.channels
    .find("name", ch.name)
    .send(`<@!${user.id}>`)
    .then(message => console.log(`Sent message: ${message.content}`))
    .catch(console.error);

  const embed = new Discord.RichEmbed()
    .setTitle("プライベートチャットに参加しました。")
    .setAuthor("To " + user.username)
    .setDescription(
      "ボイスチャンネルに参加している人だけに見えるチャンネルです。\n全員が退出すると削除されます。"
    );
  guild.channels.find("name", ch.name).send(embed);
}
