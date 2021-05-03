const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "dongu",
    description: "Müzik döngüsünü (aç/kapat) çalıştırır",
    usage: "dongu",
    aliases: ["d"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
       if (serverQueue) {
            serverQueue.loop = !serverQueue.loop;
            return message.channel.send({
                embed: {
                    color: "GREEN",
                    description: `🔁  **|**  Döngü **\`${serverQueue.loop === true ? "aktif" : "de-aktif"}\`**`
                }
            });
        };
    return sendError("Her hangi bir müzik yada video oynamıyor...", message.channel);
  },
};
