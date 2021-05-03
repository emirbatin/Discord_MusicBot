const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error")

module.exports = {
  info: {
    name: "nowplaying",
    description: "Sunucuda şu anda çalan müziği göstermek için",
    usage: "",
    aliases: ["np"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return sendError("Her hangi bir müzik yada video oynamıyor...", message.channel);
    let song = serverQueue.songs[0]
    let thing = new MessageEmbed()
      .setThumbnail(song.img)
      .setColor("BLUE")
      .addField("İsim", song.title, true)
      .addField("Süresi", song.duration, true)
      .addField("Kim tarafından açıldı:", song.req.tag, true)
      .setFooter(`İzlenme: ${song.views} | ${song.ago}`)
    return message.channel.send(thing)
  },
};
