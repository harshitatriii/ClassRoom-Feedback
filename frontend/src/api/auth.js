import client from './client';

export const loginUser = (credentials) =>
  client.post('/auth/login/', credentials);

export const registerUser = (data) =>
  client.post('/auth/register/', data);

export const logoutUser = () =>
  client.post('/auth/logout/');

export const getProfile = () =>
  client.get('/auth/profile/');

export const updateProfile = (data) =>
  client.put('/auth/profile/', data);
