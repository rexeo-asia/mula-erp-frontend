import axios from 'axios';

const API_URL = '/api/config';

export const getAppConfig = () => {
  return axios.get(API_URL);
};
