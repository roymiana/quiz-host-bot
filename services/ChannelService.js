import axios from 'axios';

export const BASE_URL = 'http://localhost:8000';

const ChannelService = {
  getChannels: ({ serverId }) =>
    axios.get(`${BASE_URL}/servers/${serverId}/channels`),
  addChannel: ({ serverId, body }) =>
    axios.post(`${BASE_URL}/servers/${serverId}/channels`, body),
  deleteChannel: ({ id }) => axios.delete(`${BASE_URL}/channels/${id}`),
};

export default ChannelService;
