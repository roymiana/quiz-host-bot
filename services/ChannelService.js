import axios from 'axios';

export const BASE_URL = 'http://localhost:8000';

const ChannelService = {
  getChannel: ({ channelId }) => axios.get(`${BASE_URL}/channels/${channelId}`),
  getChannels: ({ serverId }) =>
    axios.get(`${BASE_URL}/servers/${serverId}/channels`),
  addChannel: ({ serverId, body }) =>
    axios.post(`${BASE_URL}/servers/${serverId}/channels`, body),
  deleteChannel: ({ id }) => axios.delete(`${BASE_URL}/channels/${id}`),
  updateChannel: ({ id, body }) => axios.patch(`${BASE_URL}/channels/${id}`, body),
};

export default ChannelService;
