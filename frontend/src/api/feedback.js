import client from './client';

export const submitFeedback = (data) => client.post('/feedback/', data);
export const getFeedbackList = (params) => client.get('/feedback/', { params });
export const getFeedbackDetail = (id) => client.get(`/feedback/${id}/`);

// Faculty feedback responses
export const submitResponse = (data) => client.post('/feedback-responses/', data);
export const updateResponse = (id, data) => client.put(`/feedback-responses/${id}/`, data);
export const deleteResponse = (id) => client.delete(`/feedback-responses/${id}/`);
