import ChannelService from '../services/ChannelService.js';

const messageAll = async (guild, content) => {
  let serverId = guild.id;
  let { data } = await ChannelService.getChannels({ serverId: serverId });
  data.map(curr => {
    if (curr.id != 'gen' + serverId) {
      guild.channels.cache.get(curr.text_channel).send(content);
    }
  });
  return 'sent';
};

const embedQuestion = async (MessageEmbed, content) => {
  const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Question ' + questions.length)
    .setDescription(content);

  return exampleEmbed;
};

const embedAnswers = async (MessageEmbed, content) => {
  const embedans = new MessageEmbed()
    .setColor('#ffda4f')
    .setTitle(
      'Question ' + questions.length + ': ' + questions[questions.length - 1]
    )
    .setDescription(content);
  return embedans;
};

export { messageAll, embedQuestion, embedAnswers };
