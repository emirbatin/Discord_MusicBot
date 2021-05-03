const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "queue",
    description: "Şarkıları sırasını göstermek için kullanılır",
    usage: "",
    aliases: ["q", "list", "songlist", "song-list"],
  },

  run: async function (client, message, args) {
 
  const permissions = message.channel.permissionsFor(message.client.user);
    if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
      return sendError("Missing permission to manage messages or add reactions",message.channel);

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return sendError("There is nothing playing in this server.",message.channel)

    let currentPage = 0;
    const embeds = generateQueueEmbed(message, queue.songs);

    const queueEmbed = await message.channel.send(
      `**\`${currentPage + 1}\`**/**${embeds.length}**`,
      embeds[currentPage]
    );

    try {
      await queueEmbed.react("⬅️");
      await queueEmbed.react("🛑");
      await queueEmbed.react("➡️");
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "🛑", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(`**\`${currentPage + 1}\`**/**${embeds.length}**`, embeds[currentPage]);
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(`**\`${currentPage + 1}\`**/**${embeds.length}**`, embeds[currentPage]);
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message).catch(console.error);
      }
    });
  }
};

function generateQueueEmbed(message, queue) {
  let embeds = [];
  let k = 10;

  for (let i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    let j = i;
    k += 10;

    const info = current.map((track) => `**\`${++j}\`** | [\`${track.title}\`](${track.url})`).join("\n");
  
    const serverQueue =message.client.queue.get(message.guild.id);
    const embed = new MessageEmbed()
     .setAuthor("Şarkı Sırası", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
    .setThumbnail(message.guild.iconURL())
    .setColor("BLUE")
    .setDescription(`${info}`)
    .addField("Şuan çalıyor", `[${queue[0].title}](${queue[0].url})`, true)
    .addField("Metin Kanalı", serverQueue.textChannel, true)
    .addField("Ses Kanalı", serverQueue.voiceChannel, true)
    .setFooter("Şu anda geçerli ses seviyesi "+serverQueue.volume)
     if(serverQueue.songs.length === 1)embed.setDescription(`Bundan sonra çalınacak şarkı yok ve şarkıları \`\`${message.client.config.prefix}play <song_name> ile ekle\`\``)

    embeds.push(embed);
  }

  return embeds;
 
};
