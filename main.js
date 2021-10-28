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

    if(isAdmin) {
        switch (args[1]) {
            case 'create':
                if (!args[2]) {
                    message.channel.send('Enter valid number');
                    break;
                }
                if(isNaN(args[2])) {
                    message.channel.send('Enter valid number');
                    break;
                }

                let {data: createData} = await ChannelService.getChannels({ serverId: serverId })

                if(createData.length > 0){
                    message.channel.send('Teams have already been created.')
                    break;
                }

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
                        is_currently_asking: false,
                        is_questioning: false,
                        is_timeup: false,
                        time: 60,
                        currentQuestion:"",
                    },
                    });
                    message.channel.send('Server has been set up!');
                } else {
                    message.channel.send('Server has already been set up.');
                }
                break;
            case 'timer':
                if (argLength === 2) {
                    message.channel.send('```Indicate the time after the command```');
                    break;
                }

                ServerService.updateServer({
                    id: serverId,
                    body: {
                    time: parseInt(args[2]),
                    },
                });

                message.channel.send('Timer has been set to ' + args[2] + ' seconds');
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
                    message.channel.send(message_content);
                }
                break;
            case 'question':
                if (argLength === 2) {
                    message.channel.send('```Include your question after the command```');
                    break;
                }
                let qData = await ServerService.getServer({ id: serverId })
                    .catch(() => {
                        message.channel.send('Server has not yet been setup');
                    });
                
                if(!qData)
                    break;

                if (!qData.data.is_questioning && !qData.data.is_currently_asking) {
                    let message_content = '';
                    for (var i = 2; i < args.length; i++) {
                        message_content += args[i] + ' ';
                    }

                    ServerService.updateServer({
                        id: serverId,
                        body: {
                            currentQuestion: message_content,
                            is_questioning: true,
                            is_currently_asking: true,
                        },
                    });

                    let embedQ = await embedQuestion(message_content);
                    
                    messageAll(message.guild, embedQ);
                    setTimer(message.guild);
                    console.log('done');
                } else if(qData.data.is_currently_asking) {
                    message.channel.send("Another Question currently in progress.");
                } else {
                    message.channel.send('```send next command first```');
                }
                break;
            case 'next':
                let nData = await ServerService.getServer({ id: serverId })
                    .catch(() => {
                        message.channel.send('Server has not yet been setup');
                    });
                
                if(!nData)
                    break;

                if(nData.data.is_currently_asking){
                    message.channel.send("Question currently in progress.");
                    break
                }

                ServerService.updateServer({
                    id: serverId,
                    body: {
                    is_questioning: false,
                    is_timeup: false,
                    is_currently_asking: false,
                    },
                });
                clearAnswer(serverId);
                message.channel.send("Proceed next question")
                break;
            case 'test':
                ChannelService.getChannels({ serverId: serverId }).then(res =>
                    {
                        console.log(res.data.length)
                    }
                );
                break;
            default:
                break;
        }
    }
    // else {
        switch (args[1]) {
            case 'submit': 
                let sData = await ServerService.getServer({ id: serverId })
                    .catch(() => {
                        message.channel.send('Server has not yet been setup');
                    });

                if(!sData)
                    break;

                if(sData.data.is_questioning && !sData.data.is_timeup){
                    let teamAnswer = '';
                    for (let i = 2; i < args.length; i++) {
                        teamAnswer += args[i] + ' ';
                    }

                    ChannelService.updateChannel({
                        id: 'team' + message.channel.id,
                        body: {
                            currentAnswer: teamAnswer,
                        }
                    }).then(() => {
                        message.channel.send('```Your Answer has been submitted.```');
                    })
                    .catch(err => {
                        message.channel.send('```This channel is not assigned to any team.```');
                    });
                }
                else if(sData.data.is_timeup){
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
