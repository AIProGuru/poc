import axios from 'axios';
import { SERVER_URL } from '../utils/config';

const signUp = async ({ firstName, lastName, email, password, role }) => {
  return await axios.post(`${SERVER_URL}/v2/signup`, { firstName, lastName, email, password, role });
};

const signIn = async ({email, password}) => {
  return await axios.post(`${SERVER_URL}/v2/signin`, {email, password});
};

const authService = {
  signUp,
  signIn,
};

export default authService;