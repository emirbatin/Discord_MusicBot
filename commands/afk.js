const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");
const fs = require('fs');


module.exports = {
  info: {
    name: "afk",
    description: "24/7",
    usage: "[afk]",
    aliases: ["24/7"],
  },

  run: async function (client, message, args) {
    let afk = JSON.parse(fs.readFileSync("./afk.json", "utf8"));
       if (!afk[message.guild.id]) afk[message.guild.id] = {
        afk: false,
    };
    var serverQueue = afk[message.guild.id]
       if (serverQueue) {
            serverQueue.afk = !serverQueue.afk;
             message.channel.send({
                embed: {
                    color: "GREEN",
                    description: `💤  **|**  AFK modu **\`${serverQueue.afk === true ? "aktif" : "de-aktif"}\`**`
                }
            });
            return  fs.writeFile("./afk.json", JSON.stringify(afk), (err) => {
        if (err) console.error(err);
    });
        };
    return sendError("Her hangi bir müzik yada video oynamıyor...", message.channel);
  },
};
