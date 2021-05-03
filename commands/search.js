const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytdlDiscord = require("ytdl-core-discord");
const YouTube = require("youtube-sr");
const sendError = require("../util/error")
const fs = require('fs');

module.exports = {
  info: {
    name: "search",
    description: "Şarkıyı aramaya yarar",
    usage: "<song_name>",
    aliases: ["sc"],
  },

  run: async function (client, message, args) {
    let channel = message.member.voice.channel;
    if (!channel)return sendError("Üzgünüm ama müzik çalmak için bir ses kanalında olmanız gerekiyor!", message.channel);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendError("Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);
    if (!permissions.has("SPEAK"))return sendError("Bu ses kanalında konuşamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);

    var searchString = args.join(" ");
    if (!searchString)return sendError("Ne aratmak istediğini soylemedin.", message.channel);

    var serverQueue = message.client.queue.get(message.guild.id);
    try {
           var searched = await YouTube.search(searchString, { limit: 10 });
          if (searched[0] == undefined)return sendError("Görünüşe göre şarkıyı YouTube'da bulamadım.", message.channel);
                    let index = 0;
                    let embedPlay = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor(`Results for \"${args.join(" ")}\"`, message.author.displayAvatarURL())
                        .setDescription(`${searched.map(video2 => `**\`${++index}\`  |** [\`${video2.title}\`](${video2.url}) - \`${video2.durationFormatted}\``).join("\n")}`)
                        .setFooter("Çalma listesine çalmak istediğiniz şarkının numarasını yazın.");
                    // eslint-disable-next-line max-depth
                    message.channel.send(embedPlay).then(m => m.delete({
                        timeout: 15000
                    }))
                    try {
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                            max: 1,
                            time: 20000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return message.channel.send({
                            embed: {
                                color: "RED",
                                description: "20 saniye içinde hiçbir şey seçilmedi, istek iptal edildi."
                            }
                        });
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await (searched[videoIndex - 1])
		    
                } catch (err) {
                    console.error(err);
                    return message.channel.send({
                        embed: {
                            color: "RED",
                            description: "🆘  **|**  Herhangi bir arama sonuc elde edemedim"
                        }
                    });
                }
            
            response.delete();
  var songInfo = video

    const song = {
      id: songInfo.id,
      title: Util.escapeMarkdown(songInfo.title),
      views: String(songInfo.views).padStart(10, ' '),
      ago: songInfo.uploadedAt,
      duration: songInfo.durationFormatted,
      url: `https://www.youtube.com/watch?v=${songInfo.id}`,
      img: songInfo.thumbnail.url,
      req: message.author
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      let thing = new MessageEmbed()
      .setThumbnail(song.img)
      .setColor("YELLOW")
      .addField("İsim", song.title, true)
      .addField("Süre", song.duration, true)
      .addField("Kim tarafından açıldı:", song.req.tag, true)
      .setFooter(`İzlenme: ${song.views} | ${song.ago}`)
      return message.channel.send(thing);
    }

   const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 80,
      playing: true,
      loop: false
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      let afk = JSON.parse(fs.readFileSync("./afk.json", "utf8"));
       if (!afk[message.guild.id]) afk[message.guild.id] = {
        afk: false,
    };
    var online = afk[message.guild.id]
    if (!song){
      if (!online.afk) {
        sendError("Herhangi bir müzik çalmadığı için kanaldan ayrılıyorum eğer botun 7/24 kalmasını istiyorsanız `!afk` komutunu kullanarak ayrılmamasını sağlaya bilirsiniz.\n\nBotu kullandığınız için teşekkürler.", message.channel)
        message.guild.me.voice.channel.leave();//If you want your bot stay in vc 24/7 remove this line :D
        message.client.queue.delete(message.guild.id);
      }
            return message.client.queue.delete(message.guild.id);
}
let stream = null; 
    if (song.url.includes("youtube.com")) {
      
      stream = await ytdl(song.url);
stream.on('error', function(er)  {
      if (er) {
        if (queue) {
        queue.songs.shift();
        play(queue.songs[0]);
  	  return sendError(`Beklenmeyen bir hata oluştu.\nPossible type \`${er}\``, message.channel)

       }
      }
    });  
}
 
    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
      const dispatcher = queue.connection
         .play(ytdl(song.url, {quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
      .on("finish", () => {
           const shiffed = queue.songs.shift();
            if (queue.loop === true) {
                queue.songs.push(shiffed);
            };
          play(queue.songs[0]);
        })

      dispatcher.setVolumeLogarithmic(queue.volume / 100);
      let thing = new MessageEmbed()
      .setAuthor("Müzik Çalmaya Başladı!", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
      .setThumbnail(song.img)
      .setColor("BLUE")
      .addField("Name", song.title, true)
      .addField("Duration", song.duration, true)
      .addField("Requested by", song.req.tag, true)
      .setFooter(`Views: ${song.views} | ${song.ago}`)
      queue.textChannel.send(thing);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      channel.guild.voice.setSelfDeaf(true)
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Ses kanalına katılamadım: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return sendError(`Ses kanalına katılamadım: ${error}`, message.channel);
    }
 
  },

};