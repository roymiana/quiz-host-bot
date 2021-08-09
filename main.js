import { Client, Guild, GuildChannel, Intents } from 'discord.js';
import dotenv from 'dotenv';
import ChannelService from './services/ChannelService.js';
dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const PREFIX = 'cd';
const token = process.env.TOKEN;

client.on('ready', () => {
  console.log('client ready!');
});

client.on('messageCreate', message => {
  if (!message.content.startsWith(PREFIX)) return;

  let args = message.content.substring(PREFIX.length).split(' ');
  console.log(args);

  switch (args[1]) {
    case 'create':
      message.guild.channels
        .create('peepoo', {
          type: 'GUILD_CATEGORY',
        })
        .then(parent => {
          message.guild.channels
            .create('hehe', {
              type: 'GUILD_TEXT',
              parent,
            })
            .then(res => {
              ChannelService.addChannel({
                body: {
                  name: res.name,
                  category_id: res.parentId,
                  text_channel: res.id,
                },
              });
            });
        });
      message.channel.send('Channels Created');
      break;
    default:
      break;
  }
});

client.login(token);
