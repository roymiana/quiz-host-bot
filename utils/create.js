import ChannelService from '../services/ChannelService.js';

const create = async (guild, teams) => {
  try {
    for (let i = 1; i <= teams; i++) {
      let textId;
      guild.channels
        .create('TEAM ' + i, {
          type: 'GUILD_CATEGORY',
        })
        .then(parent => {
          guild.channels
            .create('discussion-' + i, {
              type: 'GUILD_TEXT',
              parent,
            })
            .then(res => (textId = res.id));
          guild.channels
            .create('voice ' + i, {
              type: 'GUILD_VOICE',
              parent,
            })
            .then(res => {
              ChannelService.addChannel({
                body: {
                  name: 'team ' + i,
                  category_id: res.parentId,
                  text_channel: textId,
                  voice_channel: res.id,
                },
              });
              console.log('finish');
            });
        });
    }
  } catch (err) {
    throw err;
  }
};

export { create };
