import ChannelService from '../services/ChannelService.js';
import ServerService from '../services/ServerService.js';
import { MessageEmbed } from 'discord.js';

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

const embedQuestion = async (content) => {
  const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Question: ' + content)


  return {embeds: [exampleEmbed]};
};

const embedAnswers = async (content) => {
  const embedans = new MessageEmbed()
    .setColor('#ffda4f')
    .setDescription(content);
  return {embeds: [embedans]};
};

const getAnswer = async (serverId) => {
    let { data } = await ChannelService.getChannels({ serverId: serverId });
    let answers = "ANSWERS: \n";

    data.map(curr => {
        if (curr.id != 'gen' + serverId) {
            answers += curr.name +": "+ curr.currentAnswer +"\n";
        }
    });

    return answers;
}

const clearAnswer = async (serverId) => {
    let { data } = await ChannelService.getChannels({ serverId: serverId });

    data.map(curr => {
        if (curr.id != 'gen' + serverId) {
            ChannelService.updateChannel({
                id: 'team' + curr.id,
                body: {
                    currentAnswer: '',
                }
            });
        }
    });

    return answers;
}

const setTimer = async (guild) => {
    let serverId = guild.id;
    let { data } = await ServerService.getServer({ id: serverId });
    let time = 60;
    messageAll(guild, time + ' seconds left');
    var interval = setInterval(async () => {
        time -= 10;
        messageAll(guild, time + ' seconds left');
        if(time <= 0){
            messageAll(guild, 'TIMES UP!');
            ServerService.updateServer({
                id: serverId,
                body: {
                is_timeup: true,
                },
            });

            let answers = await getAnswer(serverId);

            let embedAns = await embedAnswers(answers);
            ChannelService.getChannel({ channelId: 'gen'+serverId }).then(res => {
                guild.channels.cache.get(res.data.answers_channel).send(embedAns);
            });
            
            clearInterval(interval);
        }
    }, 10000)
}

export { messageAll, embedQuestion, embedAnswers, clearAnswer, setTimer};
