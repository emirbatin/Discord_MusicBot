const {
	Util,
	MessageEmbed
} = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytdlDiscord = require("ytdl-core-discord");
var ytpl = require('ytpl');
const sendError = require("../util/error")
const fs = require('fs');

module.exports = {
	info: {
		name: "playlist",
		description: "Şarkı çalmak için kullanılır",
		usage: "<YouTube Playlist URL | Playlist Name>",
		aliases: ["pl"],
	},

	run: async function (client, message, args) {
		const channel = message.member.voice.channel;
		if (!channel) return sendError("Üzgünüm ama müzik çalmak için bir ses kanalında olmanız gerekiyor!", message.channel);
		const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
		var searchString = args.join(" ");
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT")) return sendError("Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);
		if (!permissions.has("SPEAK")) return sendError("Bu ses kanalında konuşamıyorum, uygun izinlere sahip olduğumdan emin olun!", message.channel);

		if (!searchString||!url) return sendError(`Usage: ${message.client.config.prefix}playlist <YouTube Playlist URL | Playlist Name>`, message.channel);
		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			try {
				const playlist = await ytpl(url.split("list=")[1]);
				if (!playlist) return sendError("Playlist bulunamadı", message.channel)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				return message.channel.send({
					embed: {
						color: "GREEN",
						description: `✅  **|**  Playlist: **\`${videos[0].title}\`** sıraya eklendi`
					}
				})
			} catch (error) {
				console.error(error);
				return sendError("Playlist bulunamadı :(",message.channel).catch(console.error);
			}
		} else {
			try {
				var searched = await yts.search(searchString)

				if (searched.playlists.length === 0) return sendError("Görünüşe göre YouTube'da oynatma listesini bulamadım", message.channel)
				var songInfo = searched.playlists[0];
				let listurl = songInfo.listId;
				const playlist = await ytpl(listurl)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				let thing = new MessageEmbed()
					.setAuthor("Playlist sıraya eklendi", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
					.setThumbnail(songInfo.thumbnail)
					.setColor("GREEN")
					.setDescription(`✅  **|**  Playlist: **\`${songInfo.title}\`** Video \`${songInfo.videoCount}\` sıraya eklendi`)
				return message.channel.send(thing)
			} catch (error) {
				return sendError("Beklenmeyen bir hata oluştu",message.channel).catch(console.error);
			}
		}

		async function handleVideo(video, message, channel, playlist = false) {
			const serverQueue = message.client.queue.get(message.guild.id);
			const song = {
				id: video.id,
				title: Util.escapeMarkdown(video.title),
				views: video.views ? video.views : "-",
				ago: video.ago ? video.ago : "-",
                                duration: video.duration,
				url: `https://www.youtube.com/watch?v=${video.id}`,
				img: video.thumbnail,
				req: message.author
			};
			if (!serverQueue) {
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

				try {
					var connection = await channel.join();
					queueConstruct.connection = connection;
					play(message.guild, queueConstruct.songs[0]);
				} catch (error) {
					console.error(`Ses kanalına katılamıyorum: ${error}`);
					message.client.queue.delete(message.guild.id);
					return sendError(`Ses kanalına katılamıyorum: ${error}`, message.channel);

				}
			} else {
				serverQueue.songs.push(song);
				if (playlist) return;
				let thing = new MessageEmbed()
					.setAuthor("Sıraya şarkıya eklendi", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
					.setThumbnail(song.img)
					.setColor("YELLOW")
					.addField("İsim", song.title, true)
					.addField("Süre", song.duration, true)
					.addField("Kim tarafından açıldı:", song.req.tag, true)
					.setFooter(`İzlenme: ${song.views} | ${song.ago}`)
				return message.channel.send(thing);
			}
			return;
		}

async	function play(guild, song) {
			const serverQueue = message.client.queue.get(message.guild.id);
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
        if (serverQueue) {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
  	  return sendError(`Beklenmeyen bir hata oluştu.\nPossible type \`${er}\``, message.channel)

         }
       }
     });
}
 
      serverQueue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
			const dispatcher = serverQueue.connection
         .play(ytdl(song.url,{quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })

    dispatcher.setVolume(serverQueue.volume / 100);
let thing = new MessageEmbed()
				.setAuthor("Müzik Çalmaya Başladı!", "https://thumbs.gfycat.com/ThisLividGuineapig-max-1mb.gif")
				.setThumbnail(song.img)
				.setColor("BLUE")
				.addField("İsim", song.title, true)
				.addField("Süre", song.duration, true)
				.addField("Kim tarafından açıldı:", song.req.tag, true)
				.setFooter(`İzlenme: ${song.views} | ${song.ago}`)
    serverQueue.textChannel.send(thing);
}


	},



};
