import { Client, Guild, GuildChannel, Intents } from 'discord.js';
import dotenv from 'dotenv';
import ChannelService from './services/ChannelService.js';
import { create } from './utils/create.js';
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

  let args = message.content.split(' ');
  console.log(args);

  switch (args[1]) {
    case 'create':
      if (!args[2]) return;
      await create(message.guild, parseInt(args[2]));
      console.log('created');
      message.channel.send('Channels Created');
      break;
    default:
      break;
  }
});

client.login(token);
