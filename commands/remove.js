const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "remove",
    description: "Sıradan şarkıyı kaldır",
    usage: "rm <number>",
    aliases: ["rm"],
  },

  run: async function (client, message, args) {
   const queue = message.client.queue.get(message.guild.id);
    if (!queue) return sendError("Kuyruk yok.",message.channel).catch(console.error);
    if (!args.length) return sendError(`Usage: ${client.config.prefix}\`remove <Queue Number>\``);
    if (isNaN(args[0])) return sendError(`Usage: ${client.config.prefix}\`remove <Queue Number>\``);
    if (queue.songs.length == 1) return sendError("Kuyruk yok.",message.channel).catch(console.error);
    if (args[0] > queue.songs.length)
      return sendError(`Sıra sadece ${queue.songs.length} şarkılar uzun!`,message.channel).catch(console.error);
try{
    const song = queue.songs.splice(args[0] - 1, 1); 
    sendError(`❌ **|** Kaldırıldı: **\`${song[0].title}\`** kuyruktan kaldırıldı.`,queue.textChannel).catch(console.error);
                   message.react("✅")
} catch (error) {
        return sendError(`:not : Beklenmedik bir sorun oluştu.\nPossible type: ${error}`, message.channel);
      }
  },
};
