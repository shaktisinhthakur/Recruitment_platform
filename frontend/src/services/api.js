import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Jobs
export const getJobs = () => api.get('/jobs');
export const getJob = (id) => api.get(`/jobs/${id}`);
export const createJob = (data) => api.post('/jobs', data);
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const postJobToPlatforms = (id, platforms) =>
  api.post(`/jobs/${id}/post`, { platforms });
export const getAvailablePlatforms = () => api.get('/jobs/platforms');

// Upload
export const uploadJD = (file) => {
  const formData = new FormData();
  formData.append('jd', file);
  return api.post('/upload/jd', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadJDAndCreateJob = (file, jobData) => {
  const formData = new FormData();
  formData.append('jd', file);
  Object.entries(jobData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return api.post('/upload/jd/create-job', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};