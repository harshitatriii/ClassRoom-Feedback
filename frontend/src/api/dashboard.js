import client from './client';

export const getDashboardStats = () => client.get('/dashboard/stats/');
export const getSubjectAnalytics = (id) => client.get(`/analysis/subject/${id}/`);
export const getSchoolAnalytics = (params) => client.get('/analysis/school/', { params });
