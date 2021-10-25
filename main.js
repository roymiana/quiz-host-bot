import { Client, Guild, GuildChannel, Intents, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import ChannelService from './services/ChannelService.js';

import ServerService from './services/ServerService.js';
import { create, reset } from './utils/create.js';
import { messageAll, embedQuestion,clearAnswer, setTimer} from './utils/message.js';
import colors from './utils/colors.js';
dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const PREFIX = 'cd';
const token = process.env.TOKEN;

client.on('ready', () => {
    console.log('client ready!');
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX)) return;

    let serverId = message.guild.id;

    let args = message.content.split(' ');
    let argLength = args.length;
    console.log(args);

    let isAdmin = message.member.permissions.has("ADMINISTRATOR");
    console.log(isAdmin);

    if(isAdmin) {
        switch (args[1]) {
            case 'create':
                if (!args[2]) return;
                let result = await create(message.guild, parseInt(args[2]));
                console.log(result);
                let messageString = '';
                result.map(curr => {
                    messageString += `<@&${curr}> `;
                });
                message.channel.send('TEAMS CREATED: ' + messageString);
                break;
            case 'delete':
                let deleted = await reset(message.guild);
                console.log(deleted);
                message.channel.send('TEAMS DELETED');
                break;
            case 'setup':
                let serverName = message.guild.name;
                const err = await ServerService.getServer({ id: serverId }).catch(
                    err => err
                );
                if (!err.status && err.response.status === 404) {
                    await ServerService.addServer({
                    body: {
                        id: serverId,
                        name: serverName,
                        is_questioning: false,
                        is_timeup: false,
                        time: 60,
                    },
                    });
                    message.channel.send('Server has been set up!');
                } else {
                    message.channel.send('Server has already been set up.');
                }
                break;
            case 'sendall':
                if (argLength === 2) {
                    message.channel.send('```Include your message after the command```');
                } else {
                    let message_content = '```';
                    for (var i = 2; i < args.length; i++) {
                        message_content += args[i] + ' ';
                    }
                    message_content += '```';
                    messageAll(message.guild, message_content);
                }
                break;
            case 'question':
                if (argLength === 2) {
                    message.channel.send('```Include your question after the command```');
                    break;
                }
                let { data } = await ServerService.getServer({ id: serverId });
                if (!data.is_questioning) {
                    ServerService.updateServer({
                    id: serverId,
                    body: {
                        is_questioning: true,
                    },
                    });
                    let message_content = '';
                    for (var i = 2; i < args.length; i++) {
                        message_content += args[i] + ' ';
                    }
                    let embedQ = await embedQuestion(message_content);
                    
                    messageAll(message.guild, embedQ);
                    setTimer(message.guild);
                    console.log('done');
                } else {
                    message.channel.send('```send ?next command first```');
                }
                break;
            case 'next':
                ServerService.updateServer({
                    id: serverId,
                    body: {
                    is_questioning: false,
                    is_timeup: false,
                    },
                });
                clearAnswer(serverId);
                console.log('done');
                break;
            case 'test':
                ChannelService.getChannels({ serverId: serverId }).then(res =>
                    console.log(res.data[0].scores_channel)
                );
                break;
            default:
                break;
        }
    }
    // else {
        switch (args[1]) {
            case 'submit': 
                let { data } = await ServerService.getServer({ id: serverId });
                if(data.is_questioning && !data.is_timeup){
                    let teamAnswer = '';
                    for (let i = 2; i < args.length; i++) {
                        teamAnswer += args[i] + ' ';
                    }

                    ChannelService.updateChannel({
                        id: 'team' + message.channel.id,
                        body: {
                            currentAnswer: teamAnswer,
                        }
                    });

                    message.channel.send('```Your Answer has been submitted.```');
                }
                else if(data.is_timeup){
                    message.channel.send("```TIME'S ALREADY UP\nThe answer is not recorded.```");
                }
                else{
                    message.channel.send("```Question has not yet been set```");
                }
                break;
            default:
                break;
        }
    // }
});

client.login(token);
