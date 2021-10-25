import ChannelService from '../services/ChannelService.js';
import colors from './colors.js';

const create = async (guild, teams) => {
  let roleIds = [];
  let everyoneId = guild.roles.everyone.id;
  let serverId = guild.id;

  let { id: generalId } = await guild.channels.create('General', {
    type: 'GUILD_CATEGORY',
    permissionOverwrites: [
      {
        id: everyoneId,
        deny: ['SEND_MESSAGES'],
      },
    ],
  });

  let { id: team_answersId } = await guild.channels.create('team-answers', {
    type: 'GUILD_TEXT',
    parent: generalId,
  });

  let { id: scoresId } = await guild.channels.create('scores', {
    type: 'GUILD_TEXT',
    parent: generalId,
  });

  ChannelService.addChannel({
    serverId: serverId,
    body: {
      id: 'gen' + serverId,
      name: 'General',
      general_id: generalId,
      answers_channel: team_answersId,
      scores_channel: scoresId,
    },
  });

  for (let i = 1; i <= teams; i++) {
    let { id: roleId } = await guild.roles.create({
      name: 'TEAM ' + i,
      color: colors.name[(i - 1) % colors.name.length],
      hoist: true,
    });

    let { id: categoryId } = await guild.channels.create('TEAM ' + i, {
      type: 'GUILD_CATEGORY',
      permissionOverwrites: [
        {
          id: everyoneId,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: roleId,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });

    let { id: text_channel } = await guild.channels.create('discussion-' + i, {
      type: 'GUILD_TEXT',
      parent: categoryId,
    });

    let { id: voice_channel } = await guild.channels.create('voice ' + i, {
      type: 'GUILD_VOICE',
      parent: categoryId,
    });

    ChannelService.addChannel({
      serverId: serverId,
      body: {
        id: 'team'+text_channel,
        name: 'team ' + i,
        role_id: roleId,
        category_id: categoryId,
        text_channel: text_channel,
        voice_channel: voice_channel,
        hasSubmitted: false,
        currentAnswer: '',
      },
    });

    roleIds.push(roleId);
  }

  return roleIds;
};

const reset = async guild => {
  let serverId = guild.id;
  let { data } = await ChannelService.getChannels({ serverId: serverId });
  data.map(curr => {
    if (curr.id === 'gen' + serverId) {
      console.log(curr.id);
      guild.channels.fetch(curr.scores_channel).then(channel => {
        channel.delete();
      });
      guild.channels.fetch(curr.answers_channel).then(channel => {
        channel.delete();
      });
      guild.channels.fetch(curr.general_id).then(channel => {
        channel.delete();
      });
    } else {
      guild.channels.fetch(curr.text_channel).then(channel => {
        channel.delete();
      });
      guild.channels.fetch(curr.voice_channel).then(channel => {
        channel.delete();
      });
      guild.channels.fetch(curr.category_id).then(channel => {
        channel.delete();
      });
      guild.roles.fetch(curr.role_id).then(roles => {
        roles.delete();
      });
    }
    let id = curr.id;
    ChannelService.deleteChannel({ id });
  });

  return 'deleted';
};

export { create, reset };
