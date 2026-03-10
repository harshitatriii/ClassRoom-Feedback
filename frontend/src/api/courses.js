import client from './client';

// Schools
export const getSchools = (params) => client.get('/schools/', { params });
export const getSchool = (id) => client.get(`/schools/${id}/`);
export const createSchool = (data) => client.post('/schools/', data);
export const updateSchool = (id, data) => client.put(`/schools/${id}/`, data);
export const deleteSchool = (id) => client.delete(`/schools/${id}/`);

// Programs
export const getPrograms = (params) => client.get('/programs/', { params });
export const getProgram = (id) => client.get(`/programs/${id}/`);
export const createProgram = (data) => client.post('/programs/', data);
export const updateProgram = (id, data) => client.put(`/programs/${id}/`, data);
export const deleteProgram = (id) => client.delete(`/programs/${id}/`);

// Subjects
export const getSubjects = (params) => client.get('/subjects/', { params });
export const getSubject = (id) => client.get(`/subjects/${id}/`);
export const createSubject = (data) => client.post('/subjects/', data);
export const updateSubject = (id, data) => client.put(`/subjects/${id}/`, data);
export const deleteSubject = (id) => client.delete(`/subjects/${id}/`);
