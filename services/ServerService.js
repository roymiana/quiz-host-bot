import axios from 'axios';

export const BASE_URL = 'http://localhost:8000/servers';

const ServerService = {
  getServer: ({ id }) => axios.get(`${BASE_URL}/${id}`),
  addServer: ({ body }) => axios.post(`${BASE_URL}`, body),
  deleteServer: ({ id }) => axios.delete(`${BASE_URL}/${id}`),
  updateServer: ({ id, body }) => axios.patch(`${BASE_URL}/${id}`, body),
};

export default ServerService;
