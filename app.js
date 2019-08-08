const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const cheerio = require("cheerio");
const iconv = require('iconv-lite');
const YTDL = require("ytdl-core");
const TOKEN = "NTcwNTExNzY4MjYzMDY1NjEw.XMAXBQ.4FZyNRtvKJDiEx2IaoJHhGiVn_Q";
const PREFIX = "-_..:OwOLOLXDbebsi";

var servers = {};

function play(connection, msg) {
    var server = servers[msg.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) {
            play(connection, msg);
        }
        else {
            connection.disconnect();
        }
    });
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

client.on("message", msg => {

    var args = msg.content.substring(PREFIX.length).split(" ");

    if (msg.content === "@searchrank") {
        const title = new Array();
        const url = 'https://www.naver.com/';

        request(url, function (error, res, html) {
            if (!error) {
                const $ = cheerio.load(html);

                for (var i = 0; i < 10; i++) {
                    $('.ah_item > a >.ah_k').each(function () {
                        const rank = $(this);
                        const rank_text = rank.text();
                        title[i] = rank_text;
                        i++;
                    });
                }
                rank = ('\n\n<네이버 실시간 검색어 순위>\n\n');

                for (let i = 0; i < 10; i++) {
                    rank += (i + 1) + "위: " + title[i] + "\n"
                }
                msg.reply(rank);
            }
        });
    }

    if (msg.content === "@movierank") {
        const title = new Array();
        let movie = '';
        const requestOptions = { method: "GET" ,uri: "https://movie.naver.com/movie/sdb/rank/rmovie.nhn" ,
        headers: null ,encoding: null };

        request(requestOptions, function (error, res, html) {
            if (!error && res.statusCode == 200) {
                let data = iconv.decode(html, 'EUC-KR');
                const $ = cheerio.load(data);

                for (let i = 0; i < 10; i++) {
                    $('.title > .tit3 > a').each(function () {
                        if(i < 10) {
                            let title_rank = $(this).attr('title');
                            title[i] = title_rank;
                            i++;
                        }
                    });
                }
            }
            movie = ('\n\n <네이버 무비 영화 순위> \n\n');
            for(let i = 0; i < 10; i++) {
                movie += (i +1) +"위: " + title[i] + '\n'; 
            }
            msg.reply(movie);
        });
    }

    if(msg.content === "@play") {
        if(!msg.member.voiceChannel) {
            msg.channel.sendMessage("보이스 채널에 들어가세용");
        }
        if(!servers[msg.guild.id]) {
            servers[msg.guild.id] = {
                queue: []
            };
        }
        var server = servers[msg.guild.id];

        server.queue.push(args[1]);

        if(!msg.guild.voiceConnection) {
            msg.member.voiceChannel.join().then(function(connection) {
                play(connection, msg);
            });
        }
    }

    if(msg.content === "@skip") {
        var server = servers[msg.guild.id];

        if(server.dispatcher) {
            server.dispatcher.end();
        }
    }

    if(msg.content === "@stop") {
        var server = servers[msg.guild.id];

        if (msg.guild.voiceConnection) {
            msg.guild.voiceConnection.disconnect();
        }
    }
});

client.login(TOKEN);