import client from './client';

export const startLiveSession = (data) => client.post('/live/start/', data);
export const endLiveSession = (sessionId) => client.post(`/live/end/${sessionId}/`);
export const getActiveSession = () => client.get('/live/active/');
export const joinSession = (data) => client.post('/live/join/', data);
export const submitPulse = (data) => client.post('/live/pulse/', data);
export const getSessionDashboard = (sessionId) => client.get(`/live/dashboard/${sessionId}/`);
export const getSessionHistory = () => client.get('/live/history/');
