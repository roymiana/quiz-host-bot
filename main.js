import { Client, Guild, GuildChannel, Intents } from 'discord.js';
import dotenv from 'dotenv';
import ChannelService from './services/ChannelService.js';
import { create, reset } from './utils/create.js';
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

  let args = message.content.split(' ');
  console.log(args);

  switch (args[1]) {
    case 'create':
      if (!args[2]) return;
      let result = await create(message.guild, parseInt(args[2]));
      console.log(result);
      break;
    case 'delete':
      let deleted = await reset(message.guild);
      console.log(deleted);
    case 'color':
      if (!args[2]) return;
      console.log(colors.name[args[2]]);
      console.log(colors.name.length);
      break;
    default:
      break;
  }
});

client.login(token);
