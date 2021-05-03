const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");
const yts = require("yt-search");
const fs = require('fs');
const sendError = require("../util/error")

module.exports = {
  info: {
    name: "play",
    description: "Şarkı çalmak için kullanılır",
    usage: "<YouTube_URL> | <song_name>",
    aliases: ["p"],
  },

  run: async function (client, message, args) {
    let channel = message.member.voice.channel;
    if (!channel)return sendError("Üzgünüm ama müzik çalmak için bir ses kanalında olmanız gerekiyor!", message.channel);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendError("Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);
    if (!permissions.has("SPEAK"))return sendError("Bu ses kanalında konuşamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);

    var searchString = args.join(" ");
    if (!searchString)return sendError("Oynamak istediğin müziği söylemedin", message.channel);
   	const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
   var serverQueue = message.client.queue.get(message.guild.id);

     let songInfo = null;
    let song = null;
    if (url.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)) {
       try {
          songInfo = await ytdl.getInfo(url)
          if(!songInfo)return sendError("Görünüşe göre şarkıyı YouTube'da bulamadım", message.channel);
        song = {
       id: songInfo.videoDetails.videoId,
       title: songInfo.videoDetails.title,
       url: songInfo.videoDetails.video_url,
       img: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
      duration: songInfo.videoDetails.lengthSeconds,
      ago: songInfo.videoDetails.publishDate,
      views: String(songInfo.videoDetails.viewCount).padStart(10, ' '),
      req: message.author

        };

      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }else {
      try {
        var searched = await yts.search(searchString);
    if(searched.videos.length === 0)return sendError("Görünüşe göre şarkıyı YouTube'da bulamadım", message.channel)
    
     songInfo = searched.videos[0]
        song = {
      id: songInfo.videoId,
      title: Util.escapeMarkdown(songInfo.title),
      views: String(songInfo.views).padStart(10, ' '),
      url: songInfo.url,
      ago: songInfo.ago,
      duration: songInfo.duration.toString(),
      img: songInfo.image,
      req: message.author
        };
      } catch (error) {
        console.error(error);
        return message.reply(error.message).catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      let thing = new MessageEmbed()
      .setThumbnail(song.img)
      .setColor("YELLOW")
      .addField("İsim", song.title, true)
      .addField("Süre", song.duration, true)
      .addField("Kim tarafından açıldı:", song.req.tag, true)
      .setFooter(`İzlenme ${song.views} | ${song.ago}`)
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
  	  return sendError(`Beklenmeyen bir hata oluştu.\nOlası tip \`${er}\``, message.channel)
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
          play(queue.songs[0])
        })

      dispatcher.setVolumeLogarithmic(queue.volume / 100);
      let thing = new MessageEmbed()
      .setAuthor("Müzik çalmaya başladı.", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
      .setThumbnail(song.img)
      .setColor("BLUE")
      .addField("İsim", song.title, true)
      .addField("Süre", song.duration, true)
      .addField("Kim tarafından açıldı:", song.req.tag, true)
      .setFooter(`İzlenme: ${song.views} | ${song.ago}`)
      queue.textChannel.send(thing);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Ses kanalına katılamadım: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return sendError(`Ses kanalına katılamadım: ${error}`, message.channel);
    }
  


},

};
