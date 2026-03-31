import client from './client';

export const submitFeedback = (data) => client.post('/feedback/', data);
export const getFeedbackList = (params) => client.get('/feedback/', { params });
export const getFeedbackDetail = (id) => client.get(`/feedback/${id}/`);

// Faculty feedback responses
export const submitResponse = (data) => client.post('/feedback-responses/', data);
export const updateResponse = (id, data) => client.put(`/feedback-responses/${id}/`, data);
export const deleteResponse = (id) => client.delete(`/feedback-responses/${id}/`);

// Feedback campaigns
export const getCampaigns = () => client.get('/campaigns/');
export const getCampaign = (id) => client.get(`/campaigns/${id}/`);
export const createCampaign = (data) => client.post('/campaigns/', data);
export const updateCampaign = (id, data) => client.put(`/campaigns/${id}/`, data);
export const deleteCampaign = (id) => client.delete(`/campaigns/${id}/`);
export const getMyCampaignStatus = () => client.get('/campaigns/my-status/');
export const getCampaignCompletion = (id) => client.get(`/campaigns/${id}/completion/`);
