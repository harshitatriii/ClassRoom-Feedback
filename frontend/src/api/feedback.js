import client from './client';

export const submitFeedback = (data) => client.post('/feedback/', data);
export const getFeedbackList = (params) => client.get('/feedback/', { params });
export const getFeedbackDetail = (id) => client.get(`/feedback/${id}/`);
