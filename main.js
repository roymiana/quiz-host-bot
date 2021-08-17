import { Client, Guild, GuildChannel, Intents } from 'discord.js';
import dotenv from 'dotenv';
import ChannelService from './services/ChannelService.js';

import ServerService from './services/ServerService.js';
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
      let serverId = message.guild.id;
      let serverName = message.guild.name;
      const err = await ServerService.getServer({ id: serverId }).catch(
        err => err
      );

      if (!err.status && err.response.status === 404) {
        await ServerService.addServer({
          body: {
            id: serverId,
            name: serverName,
          },
        });
        message.channel.send('Server has been set up!');
      } else {
        message.channel.send('Server has already been set up.');
      }
      break;
    case 'test':
      ChannelService.getChannel({ channelId: 'gen' }).then(res =>
        console.log(res.data)
      );
      break;
    default:
      break;
  }
});

client.login(token);
