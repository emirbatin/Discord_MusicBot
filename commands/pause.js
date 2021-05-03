const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "pause",
    description: "Şuan çalan müziği duraklatmak için",
    usage: "[pause]",
    aliases: ["pause"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
	    try{
      serverQueue.connection.dispatcher.pause()
	  } catch (error) {
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: Bot durduruldu ve sıra temizlendi.: ${error}`, message.channel);
      }	    
      let xd = new MessageEmbed()
      .setDescription("⏸ Müzik durdurma işlemi tamamlandı!")
      .setColor("YELLOW")
      .setTitle("Müzik Durdurma")
      return message.channel.send(xd);
    }
    return sendError("Her hangi bir müzik yada video oynamıyor...", message.channel);
  },
};
