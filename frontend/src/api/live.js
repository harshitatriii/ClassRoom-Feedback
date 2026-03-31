import client from './client';

export const startLiveSession = (data) => client.post('/live/start/', data);
export const endLiveSession = (sessionId) => client.post(`/live/end/${sessionId}/`);
export const getActiveSession = () => client.get('/live/active/');
export const joinSession = (data) => client.post('/live/join/', data);
export const submitPulse = (data) => client.post('/live/pulse/', data);
export const getSessionDashboard = (sessionId) => client.get(`/live/dashboard/${sessionId}/`);
export const getSessionHistory = () => client.get('/live/history/');

// Live Questions
export const submitQuestion = (data) => client.post('/live/questions/', data);
export const getQuestions = (sessionId) => client.get(`/live/questions/${sessionId}/`);
export const upvoteQuestion = (questionId) => client.post(`/live/questions/${questionId}/upvote/`);
export const markQuestionAnswered = (questionId) => client.post(`/live/questions/${questionId}/answered/`);

// Session students
export const getSessionStudents = (sessionId) => client.get(`/live/students/${sessionId}/`);
