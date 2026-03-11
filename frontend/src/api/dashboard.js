import client from './client';

export const getDashboardStats = () => client.get('/dashboard/stats/');
export const getSubjectAnalytics = (id) => client.get(`/analysis/subject/${id}/`);
export const getSchoolAnalytics = (params) => client.get('/analysis/school/', { params });

// CSV Exports
export const exportFeedbackCSV = (params) => client.get('/export/feedback/', { params, responseType: 'blob' });
export const exportSubjectReportCSV = () => client.get('/export/subjects/', { responseType: 'blob' });
