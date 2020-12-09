// Discord bot implements
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");

module.exports = {
  onVoiceStateUpdate: onVoiceStateUpdate
};

const CHANNEL_PREFIX = "🔑";
const BOT_ROLE_NAME = "BOT";

async function onVoiceStateUpdate(oldState, newState) {
  if (oldState.channelID === newState.channelID) {
    return;
  }

  if (oldState.channelID != null) {
    const oldChannel = oldState.guild.channels.cache.get(oldState.channelID);
    if (oldChannel.members.size == 0) {
      await txChDelete(oldChannel);
    } else {
      await chExit(oldChannel, newState.member);
    }
  }

  if (newState.channelID != null) {
    let txtChannel;
    const newChannel = newState.guild.channels.cache.get(newState.channelID);
    if (newChannel.members.size == 1) {
      txtChannel = await txChCreate(newChannel, newState.member);
    } else {
      txtChannel = await chJoin(newChannel, newState.member);
    }
    await chSendNotification(txtChannel, newState.member);
  }
}

async function txChCreate(voiceChannel, voiceJoinedMember) {
  try {
    const guild = voiceChannel.guild;
    let chName = CHANNEL_PREFIX + voiceChannel.name + "_" + voiceChannel.id;
    let botRole = guild.roles.cache.find(val => val.name === BOT_ROLE_NAME);
    let result = await guild.channels.create(chName, {
      parent: voiceChannel.parent,
      type: "text",
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["VIEW_CHANNEL"]
        },
        {
          id: voiceJoinedMember.id,
          allow: ["VIEW_CHANNEL"]
        },
        {
          id: botRole.id,
          allow: ["VIEW_CHANNEL"]
        }
      ],
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

function chFind(voiceChannel) {
  const guild = voiceChannel.guild;
  let searchCondition = voiceChannel.id;
  let result = guild.channels.cache.find(val => val.name.endsWith(searchCondition));
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
    target.updateOverwrite(user, { VIEW_CHANNEL: true });
    return target;
  } else {
    console.log("チャンネルがないンゴ");
  }
}

async function chExit(ch, user) {
  let target = await chFind(ch);
  if (target != null) {
    target.updateOverwrite(user, { VIEW_CHANNEL: false });
  } else {
    console.log("チャンネルがないンゴ");
  }
}

async function chSendNotification(ch, user) {
  const guild = ch.guild;
  const sendChannel = await guild.channels.cache.find(val => val.name === ch.name);

  // すでにチャンネルにメンションがあるなら送信しない
  let messages = await ch.messages.fetch({ limit: 100 }).catch(console.error);
  let list = await messages.filter(m => m.content === '<@!' + user.id + '>')
  if (list.size === 0) {
    await sendChannel.send(`<@!${user.id}>`)
      .catch(console.error);

    const embed = new Discord.MessageEmbed()
      .setTitle("プライベートチャットに参加しました。")
      .setAuthor("To " + user.displayName)
      .setDescription(
        "ボイスチャンネルに参加している人だけに見えるチャンネルです。\n全員が退出すると削除されます。"
      );
    sendChannel.send(embed);
  }
}
