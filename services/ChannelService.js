import axios from 'axios';

export const BASE_URL = 'http://localhost:8000/channels';

const ChannelService = {
  getChannels: () => axios.get(`${BASE_URL}`),
  addChannel: ({ body }) => axios.post(`${BASE_URL}`, body),
  deleteChannel: ({ body }) => axios.delete(`${BASE_URL}`, body),
};

export default ChannelService;
