const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "volume",
    description: "Sunucu çalan şarkının ses düzeyini değiştirmek için kullanılır",
    usage: "[volume]",
    aliases: ["v", "vol"],
  },

  run: async function (client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel)return sendError("Üzgünüm ama müzik çalmak için bir ses kanalında olmanız gerekiyor!", message.channel);
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return sendError("Suanda herhangi bir şarki çalmıyor.", message.channel);
    if (!args[0])return message.channel.send(`Geçerli Ses Seviyesi: **${serverQueue.volume}**`);
     if(isNaN(args[0])) return message.channel.send(':not : Sadece Sayı!').catch(err => console.log(err));
    if(parseInt(args[0]) > 150 ||(args[0]) < 0) return sendError('Sesi 150\'den fazla veya 0\'ın altına ayarlayamazsınız',message.channel).catch(err => console.log(err));
    serverQueue.volume = args[0]; 
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    let xd = new MessageEmbed()
    .setDescription(`Sesi ayarladım: **${args[0]/1}/100**`)
    .setColor("BLUE")
    return message.channel.send(xd);
  },
};
